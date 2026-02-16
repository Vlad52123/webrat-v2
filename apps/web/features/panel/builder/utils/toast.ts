export type ToastType = "success" | "error" | "warning" | "info";

export function showToastSafe(type: ToastType, message: string) {
    try {
        window.WebRatCommon?.showToast?.(type, message);
    } catch {
    }
}
