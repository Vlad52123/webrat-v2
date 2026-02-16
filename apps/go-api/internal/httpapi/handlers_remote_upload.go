package httpapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

func (s *Server) handleRemoteUpload(w http.ResponseWriter, r *http.Request) {
	if r == nil || w == nil {
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if !s.checkCSRF(w, r) {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	const maxUploadSize = 512 << 20
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		log.Println("remote-upload parse form error:", err)
		http.Error(w, "bad form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("remote-upload form file error:", err)
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	head := make([]byte, 2)
	if _, err := io.ReadFull(file, head); err != nil {
		log.Println("remote-upload read header error:", err)
		http.Error(w, "bad file", http.StatusBadRequest)
		return
	}

	name := strings.TrimSpace(header.Filename)
	if name == "" {
		name = fmt.Sprintf("file_%d", time.Now().UnixNano())
	}

	re := regexp.MustCompile(`[^a-zA-Z0-9_.-]+`)
	name = re.ReplaceAllString(name, "_")

	ext := strings.ToLower(filepath.Ext(name))
	isPE := head[0] == 'M' && head[1] == 'Z'
	allowBat := ext == ".bat" || ext == ".cmd"

	if isPE {
		if ext == "" {
			name += ".exe"
		} else if ext != ".exe" {
			name = strings.TrimSuffix(name, ext) + ".exe"
		}
	} else if !allowBat {
		log.Println("remote-upload rejected: invalid format")
		http.Error(w, "invalid format: upload .exe or .bat", http.StatusBadRequest)
		return
	}

	remoteDir := s.remoteDir
	if remoteDir == "" {
		wd, err := os.Getwd()
		if err != nil {
			log.Println("remote-upload getwd error:", err)
			http.Error(w, "save error", http.StatusInternalServerError)
			return
		}
		remoteDir = filepath.Join(wd, "remote_uploads")
	}
	_ = os.MkdirAll(remoteDir, 0o755)

	outPath := filepath.Join(remoteDir, fmt.Sprintf("%d_%s", time.Now().UnixNano(), name))
	out, err := os.Create(outPath)
	if err != nil {
		if os.IsNotExist(err) {
			if mkErr := os.MkdirAll(remoteDir, 0o755); mkErr != nil {
				log.Println("remote-upload mkdir error:", mkErr)
			} else {
				out, err = os.Create(outPath)
			}
		}
	}
	if err != nil {
		log.Println("remote-upload create file error:", err)
		http.Error(w, "save error", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	reader := io.MultiReader(bytes.NewReader(head), file)
	if _, err := io.Copy(out, reader); err != nil {
		log.Println("remote-upload copy error:", err)
		http.Error(w, "save error", http.StatusInternalServerError)
		return
	}

	urlPath := "/remote/" + filepath.Base(outPath)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"url": urlPath})
}
