import { useEffect } from "react";

import { installToastGlobal } from "../features/panel/toast";

export function useInstallToastGlobal(): void {
    useEffect(() => {
        try {
            installToastGlobal();
        } catch {
        }
    }, []);
}
