package storage

import (
	"errors"
	"strconv"
	"strings"
)

func scanNumericFloat(v any) (float64, error) {
	switch t := v.(type) {
	case float64:
		return t, nil
	case int64:
		return float64(t), nil
	case int32:
		return float64(t), nil
	case []byte:
		return strconv.ParseFloat(strings.TrimSpace(string(t)), 64)
	case string:
		return strconv.ParseFloat(strings.TrimSpace(t), 64)
	case nil:
		return 0, nil
	default:
		return 0, errors.New("unsupported numeric type")
	}
}