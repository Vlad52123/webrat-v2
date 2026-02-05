"use client";

export function ChangePasswordModal(props: {
   open: boolean;
   onClose: () => void;
   isLoading?: boolean;
   oldPassword: string;
   setOldPassword: (v: string) => void;
   newPassword: string;
   setNewPassword: (v: string) => void;
   newPasswordAgain: string;
   setNewPasswordAgain: (v: string) => void;
   onConfirm: () => void;
}) {
   const {
      open,
      onClose,
      isLoading,
      oldPassword,
      setOldPassword,
      newPassword,
      setNewPassword,
      newPasswordAgain,
      setNewPasswordAgain,
      onConfirm,
   } = props;

   return (
      <div
         id="passwordModalBackdrop"
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
            aria-labelledby="passwordModalTitle"
         >
            <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
               <div id="passwordModalTitle" className="text-[15px] font-bold text-white">
                  Change password
               </div>
               <button
                  id="passwordModalClose"
                  className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
               >
                  <span aria-hidden="true" className="block h-[18px] w-[18px] text-center leading-[18px]">
                     ×
                  </span>
               </button>
            </div>

            <div className="grid gap-[12px] p-[18px]">
               <div className="grid gap-[4px]">
                  <input
                     id="passwordOldInput"
                     className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                     type="password"
                     autoComplete="current-password"
                     placeholder="Old password"
                     value={oldPassword}
                     onChange={(e) => setOldPassword(e.target.value)}
                  />
               </div>
               <div className="grid gap-[4px]">
                  <input
                     id="passwordNewInput"
                     className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                     type="password"
                     autoComplete="new-password"
                     placeholder="New password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                  />
               </div>
               <div className="grid gap-[4px]">
                  <input
                     id="passwordNewAgainInput"
                     className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                     type="password"
                     autoComplete="new-password"
                     placeholder="New password again"
                     value={newPasswordAgain}
                     onChange={(e) => setNewPasswordAgain(e.target.value)}
                  />
               </div>

               <div className="mt-[8px] flex justify-center">
                  <button
                     id="passwordModalConfirm"
                     className={
                        "min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]" +
                        (isLoading ? " pointer-events-none opacity-60" : "")
                     }
                     style={{ borderBottomColor: "var(--line)" }}
                     type="button"
                     disabled={Boolean(isLoading)}
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
