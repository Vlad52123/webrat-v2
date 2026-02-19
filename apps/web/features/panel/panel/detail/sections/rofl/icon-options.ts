export const ICON_OPTIONS = [
    { value: "info", label: "Info" },
    { value: "error", label: "Error" },
    { value: "warning", label: "Warning" },
    { value: "question", label: "Question" },
    { value: "none", label: "None" },
] as const;

export type IconOptionValue = (typeof ICON_OPTIONS)[number]["value"];
