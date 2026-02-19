export const BUTTON_OPTIONS = [
    { value: "ok", label: "OK" },
    { value: "okcancel", label: "OK / Cancel" },
    { value: "yesno", label: "Yes / No" },
    { value: "yesnocancel", label: "Yes / No / Cancel" },
    { value: "retrycancel", label: "Retry / Cancel" },
    { value: "abortretryignore", label: "Abort / Retry / Ignore" },
] as const;

export type ButtonOptionValue = (typeof BUTTON_OPTIONS)[number]["value"];
