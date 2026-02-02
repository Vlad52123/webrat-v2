"use client";

export function LogoutModal(props: { open: boolean; onClose: () => void; onLogout: () => void }) {
  const { open, onClose, onLogout } = props;

  return (
    <div
      id="logoutModalBackdrop"
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
        aria-labelledby="logoutModalTitle"
      >
        <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
          <div id="logoutModalTitle" className="text-[15px] font-bold text-white">
            Logout?
          </div>
          <button
            id="logoutModalClose"
            className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="grid place-items-center gap-[12px] p-[18px]">
          <div className="flex justify-center">
            <button
              id="logoutModalLogout"
              className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
              style={{ borderBottomColor: "var(--line)" }}
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}