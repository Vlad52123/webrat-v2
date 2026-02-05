package buildergen

import "strings"

func templateWS() string {
	return strings.TrimSpace(`
var wsWriteMu sync.Mutex

func wsWriteJSON(conn *websocket.Conn, v interface{}) error {
	if conn == nil {
		return fmt.Errorf("nil conn")
	}
	wsWriteMu.Lock()
	defer wsWriteMu.Unlock()
	_ = conn.SetWriteDeadline(time.Now().Add(15 * time.Second))
	return conn.WriteJSON(v)
}

func wsWriteText(conn *websocket.Conn, b []byte) error {
	if conn == nil {
		return fmt.Errorf("nil conn")
	}
	wsWriteMu.Lock()
	defer wsWriteMu.Unlock()
	_ = conn.SetWriteDeadline(time.Now().Add(15 * time.Second))
	return conn.WriteMessage(websocket.TextMessage, b)
}
`)
}