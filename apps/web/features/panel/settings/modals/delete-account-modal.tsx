"use client";

export function DeleteAccountModal(props: {
   open: boolean;
   onClose: () => void;
   password: string;
   setPassword: (v: string) => void;
   error: string;
   setError: (v: string) => void;
   onConfirm: (password: string) => void;
}) {
   const { open, onClose, password, setPassword, error, setError, onConfirm } = props;

   return (
      <div
         id="deleteModalBackdrop"
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
            aria-labelledby="deleteModalTitle"
         >
            <div className="flex items-center justify-between border-b border-white/[0.20] px-[14px] py-[12px]">
               <div id="deleteModalTitle" className="text-[15px] font-bold text-white">
                  Delete account
               </div>
               <button
                  id="deleteModalClose"
                  className="grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-[10px] border border-white/[0.14] bg-white/[0.06] text-[18px] leading-none text-white/[0.95] transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.22] active:translate-y-[1px]"
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
               >
                  ×
               </button>
            </div>
            <div className="grid gap-[12px] p-[18px] text-center">
               <div className="mb-[6px] text-[18px] font-black tracking-[0.08em] text-[#ff5555] [text-shadow:0_0_4px_#ff5555]">
                  WARNING
               </div>
               <div className="text-[13px] font-semibold text-white/[0.82]">This action is irreversible.</div>
               <div className="text-[13px] font-semibold text-white/[0.82]">Your username and subscription may be lost.</div>

               <div className="grid gap-[4px]">
                  <input
                     id="deleteModalPassword"
                     className="h-[38px] rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                     type="password"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                     }}
                  />
                  {error ? <div className="text-[12px] font-semibold text-[#ff7070]">{error}</div> : null}
               </div>

               <div className="mt-[10px] flex justify-center">
                  <button
                     id="deleteModalConfirm"
                     className="min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
                     style={{ borderBottomColor: "var(--line)" }}
                     type="button"
                     onClick={() => onConfirm(String(password || "").trim())}
                  >
                     Delete forever
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
