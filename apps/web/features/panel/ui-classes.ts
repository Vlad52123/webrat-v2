export const MODAL_OVERLAY =
    "fixed inset-0 z-[2000] items-center justify-center bg-black/[0.62] backdrop-blur-[10px]";

export const MODAL_OVERLAY_FLEX = MODAL_OVERLAY + " flex";

export const modalOverlayCn = (open: boolean) =>
    MODAL_OVERLAY + " " + (open ? "flex" : "hidden");


export const MODAL_CARD_340 =
    "w-[340px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]";

export const MODAL_CARD_360 =
    "w-[360px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]";

export const MODAL_CARD_420 =
    "w-[420px] max-w-[calc(100vw-40px)] overflow-hidden rounded-[16px] border border-white/[0.18] bg-[rgba(18,18,18,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-[8px]";

export const MODAL_HEADER =
    "flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]";


export const MODAL_CLOSE_BTN =
    "grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]";

export const MODAL_CLOSE_ICON =
    "block h-[18px] w-[18px] text-center leading-[18px]";

export const MODAL_CONFIRM_BTN =
    "min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]";

export const MODAL_CONFIRM_BTN_WIDE =
    "min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]";

export const MODAL_CANCEL_BTN =
    "min-w-[110px] cursor-pointer rounded-[12px] border border-white/[0.14] bg-white/[0.06] px-[22px] py-[10px] text-[14px] font-semibold text-white/[0.85] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]";

export const MODAL_INPUT =
    "h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]";

export const DROPDOWN_MENU =
    "fixed z-[9999] max-h-[240px] overflow-auto rounded-[14px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] p-[6px] text-white shadow-[0_14px_34px_rgba(0,0,0,0.55)]";

export const dropdownOptionCn = (selected: boolean) =>
    "w-full flex items-center justify-between px-[10px] py-[9px] rounded-[12px] text-[13px] leading-[1.15] font-semibold transition-[background,border-color] cursor-pointer border " +
    (selected
        ? "bg-white/[0.07] border-white/[0.16] text-white"
        : "bg-transparent border-transparent text-white/90 hover:bg-white/[0.045] hover:border-white/[0.10]");
