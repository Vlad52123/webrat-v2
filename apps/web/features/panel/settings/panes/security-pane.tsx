"use client";

import type { SettingsTabKey } from "../../state/settings-tab";

export function SecurityPane(props: {
  tab: SettingsTabKey;
  securityLogin: string;
  securitySub: string;
  securityEmail: string;
  securityRegDate: string;
  onOpenPassword: () => void;
  onOpenEmail: () => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
}) {
  const { tab, securityLogin, securitySub, securityEmail, securityRegDate, onOpenPassword, onOpenEmail, onOpenLogout, onOpenDelete } = props;
  const isRater = String(securitySub || "").toUpperCase() === "RATER";

  return (
    <div className="min-h-[220px]" data-settings-pane="security" style={{ display: tab === "security" ? "block" : "none" }}>
      <div className="overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(32,32,32,0.6)] p-[16px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px] min-h-[360px]">
        <div className="mb-[12px] ml-[2px] mt-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]">Security</div>

        <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
          <div className="text-[15px] font-medium text-white opacity-90">Login:</div>
          <div id="securityLoginValue" className="text-[14px] font-bold text-white/[0.92]">
            {securityLogin}
          </div>
        </div>

        <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

        <button
          id="securityPasswordRow"
          className={
            "my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.18] px-[12px] py-[10px] text-left cursor-pointer " +
            "bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] " +
            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_10px_22px_rgba(0,0,0,0.25)] transition-[background,border-color,transform,box-shadow] duration-150 " +
            "hover:border-[rgba(235,200,255,0.40)] hover:translate-y-[-1px] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_14px_26px_rgba(0,0,0,0.30)] hover:bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_72%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]"
          }
          type="button"
          onClick={onOpenPassword}
        >
          <div className="text-[15px] font-medium text-white opacity-90">Password:</div>
          <div className="inline-flex items-center gap-[6px]">
            <span id="securityPasswordValue" className="text-[14px] font-semibold text-white">
              Change password
            </span>
            <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[16px] w-[16px] invert opacity-90" />
          </div>
        </button>

        <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

        <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
          <div className="text-[15px] font-medium text-white opacity-90">Subscription:</div>
          <div
            id="securitySubValue"
            className={"text-[14px] font-bold " + (isRater ? "text-[#ff3b3b]" : "text-white/[0.92]")}
          >
            {securitySub}
          </div>
        </div>

        <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

        <button
          id="securityMailRow"
          className={
            "my-[6px] flex w-full items-center justify-between gap-3 rounded-[12px] border border-white/[0.18] px-[12px] py-[10px] text-left cursor-pointer " +
            "bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] " +
            "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_10px_22px_rgba(0,0,0,0.25)] transition-[background,border-color,transform,box-shadow] duration-150 " +
            "hover:border-[rgba(235,200,255,0.40)] hover:translate-y-[-1px] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_14px_26px_rgba(0,0,0,0.30)] hover:bg-[radial-gradient(140px_60px_at_12%_18%,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_72%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]"
          }
          type="button"
          onClick={onOpenEmail}
        >
          <div className="text-[15px] font-medium text-white opacity-90">Your mail:</div>
          <div className="inline-flex items-center gap-[6px]">
            <span id="securityMailValue" className="text-[14px] font-semibold text-white">
              {securityEmail}
            </span>
            <img src="/icons/arrow.svg" alt=">" draggable={false} className="h-[16px] w-[16px] invert opacity-90" />
          </div>
        </button>

        <div className="my-[8px] h-px bg-[rgba(180,180,180,0.4)]" />

        <div className="my-[6px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.16] bg-white/[0.03] px-[12px] py-[10px]">
          <div className="text-[15px] font-medium text-white opacity-90">Registration date:</div>
          <div id="securityRegDateValue" className="text-[14px] font-bold text-white/[0.92]">
            {securityRegDate}
          </div>
        </div>

        <div className="mt-[12px] h-px bg-[rgba(180,180,180,0.4)]" />

        <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
          <button
            id="securityLogoutBtn"
            className="h-[36px] rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] text-white font-semibold cursor-pointer transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]"
            style={{ borderBottomColor: "var(--line)" }}
            type="button"
            onClick={onOpenLogout}
          >
            Log out
          </button>
          <button
            id="securityDeleteBtn"
            className="h-[36px] rounded-[12px] border border-[rgba(255,75,75,0.35)] border-b-[4px] bg-[rgba(255,75,75,0.10)] text-[#ff7070] font-semibold cursor-pointer transition-[background,border-color,transform] hover:bg-[rgba(255,75,75,0.16)] hover:border-[rgba(255,75,75,0.45)] active:translate-y-[1px]"
            style={{ borderBottomColor: "rgba(255,75,75,0.95)" }}
            type="button"
            onClick={onOpenDelete}
          >
            Delete acc
          </button>
        </div>
      </div>
    </div>
  );
}
