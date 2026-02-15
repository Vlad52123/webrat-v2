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
         className={
            "fixed z-[10000] min-w-[170px] select-none rounded-[14px] border border-white/[0.16] " +
            "bg-[rgba(18,18,18,0.86)] p-[6px] " +
            "shadow-[0_18px_44px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)] " +
            "backdrop-blur-[10px]"
         }
      >
         <button
            id="contextConnectBtn"
            type="button"
            className={
               "flex w-full items-center gap-[8px] rounded-[8px] border-none bg-transparent px-[12px] py-[9px] text-left text-[13px] text-[rgba(244,244,244,0.94)] " +
               "transition-[background,color,transform] duration-[140ms] hover:bg-white/[0.06] hover:text-white active:transform-none cursor-pointer"
            }
            onClick={() => {
               const vid = victimId;
               if (!vid) return;
               close();
               onOpenDetail(vid);
            }}
         >
            <span className="flex-1 min-w-0">Connect</span>
            <img
               src="/icons/default.svg"
               className="ml-auto h-[16px] w-[16px] opacity-[0.85] invert"
               alt="connect"
               draggable={false}
            />
         </button>

         <button
            id="contextDatabaseBtn"
            type="button"
            className={
               "flex w-full items-center justify-between gap-[8px] rounded-[8px] border-none bg-transparent px-[12px] py-[9px] text-left text-[13px] text-[rgba(244,244,244,0.94)] " +
               "transition-[background,color,transform] duration-[140ms] hover:bg-white/[0.06] hover:text-white active:transform-none cursor-pointer"
            }
            onClick={(e) => {
               try {
                  e.preventDefault();
                  e.stopPropagation();
               } catch {
               }
               setDbOpen(!dbOpen);
            }}
         >
            <span className="flex-1 min-w-0">Database</span>
            <img
               src="/icons/database.svg"
               className="ml-auto h-[16px] w-[16px] opacity-[0.85] invert"
               alt="database"
               draggable={false}
            />
         </button>

         {dbOpen ? (
            <div
               className={
                  "absolute left-full top-[-4px] min-w-[140px] rounded-[10px] border border-white/[0.12] " +
                  "bg-[rgba(10,10,16,0.92)] p-[4px] " +
                  "shadow-[0_14px_32px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)] " +
                  "backdrop-blur-[10px]"
               }
            >
               <button
                  id="contextDeleteBtn"
                  type="button"
                  className={
                     "flex w-full items-center gap-[8px] rounded-[8px] border-none bg-transparent px-[12px] py-[9px] text-left text-[13px] text-[rgba(244,244,244,0.94)] " +
                     "transition-[background,color,transform] duration-[140ms] hover:bg-white/[0.06] hover:text-white cursor-pointer"
                  }
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