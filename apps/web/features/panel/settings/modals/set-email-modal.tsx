"use client";

export function SetEmailModal(props: {
  open: boolean;
  onClose: () => void;
  email: string;
  setEmail: (v: string) => void;
  passwordOrCode: string;
  setPasswordOrCode: (v: string) => void;
  step: "input" | "code";
  onConfirm: () => void;
}) {
  const { open, onClose, email, setEmail, passwordOrCode, setPasswordOrCode, step, onConfirm } = props;

  return (
    <div
      id="emailModalBackdrop"
      className={
        "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px] " +
        (open ? "flex" : "hidden")
      }
      aria-hidden={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emailModalTitle"
      >
        <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
          <div id="emailModalTitle" className="text-[15px] font-bold text-white">
            Set email
          </div>
          <button
            id="emailModalClose"
            className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grid gap-[12px] p-[18px]">
          <div className="grid gap-[4px]">
            <input
              id="emailNewInput"
              className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
              type="email"
              placeholder="New mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === "code"}
            />
          </div>
          <div className="grid gap-[4px]">
            <input
              id="emailPasswordInput"
              className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
              type="password"
              placeholder={step === "code" ? "Code" : "Password"}
              value={passwordOrCode}
              onChange={(e) => setPasswordOrCode(e.target.value)}
              maxLength={step === "code" ? 8 : undefined}
            />
          </div>

          <div className="mt-[8px] flex justify-center">
            <button
              id="emailModalConfirm"
              className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
              style={{ borderBottomColor: "var(--line)" }}
              type="button"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
