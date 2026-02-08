import { createPortal } from "react-dom";

export function VictimsContextMenu(props: {
   open: boolean;
   pos: { left: number; top: number } | null;
   menuRef: React.RefObject<HTMLDivElement | null>;
   dbOpen: boolean;
   setDbOpen: (next: boolean) => void;
   victimId: string;
   close: () => void;
   onOpenDetail: (victimId: string) => void;
   onDeleteVictim: (victimId: string) => void | Promise<void>;
}) {
   const { open, pos, menuRef, dbOpen, setDbOpen, victimId, close, onOpenDetail, onDeleteVictim } = props;

   if (!open || !pos) return null;

   return createPortal(
      <div
         ref={menuRef}
         style={{ left: pos.left, top: pos.top }}
         className="fixed z-[9999] w-[160px] select-none overflow-hidden rounded-[12px] border border-white/[0.12] bg-[rgba(16,16,16,0.96)] shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
      >
         <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
            onClick={() => {
               const vid = victimId;
               if (!vid) return;
               close();
               onOpenDetail(vid);
            }}
         >
            <span>Connect</span>
            <span className="text-white/50">›</span>
         </button>

         <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
            onClick={(e) => {
               try {
                  e.preventDefault();
                  e.stopPropagation();
               } catch {
               }
               setDbOpen(!dbOpen);
            }}
         >
            <span>Database</span>
            <span className="text-white/50">›</span>
         </button>

         {dbOpen ? (
            <div className="border-t border-white/[0.08]">
               <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-[#ff7070] hover:bg-[rgba(255,75,75,0.10)]"
                  onClick={() => {
                     const vid = victimId;
                     close();
                     void onDeleteVictim(vid);
                  }}
               >
                  <span>Delete</span>
               </button>
            </div>
         ) : null}
      </div>,
      document.body,
   );
}