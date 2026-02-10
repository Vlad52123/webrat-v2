import { showToastSafe } from "../../utils/toast";
import type { BuildHistoryItem } from "../../hooks/use-builder-build-history";

export function BuildCard(props: {
   item: BuildHistoryItem;
   onDelete: (id: string) => void;
   onInfo: (id: string) => void;
}) {
   const { item, onDelete, onInfo } = props;

   return (
      <div className="build-card w-[380px] min-h-0 rounded-[16px] border border-[rgba(255,255,255,0.14)] bg-[rgba(32,32,32,0.64)] p-[14px] pb-[12px] text-[13px] shadow-[0_18px_44px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-[10px]">
         <div className="build-card-header mb-[8px] text-center text-[14px] font-black tracking-[0.2px] text-[rgba(255,255,255,0.94)]">
            {item.name || "build"}
         </div>
         <div className="build-card-separator mb-[8px] h-px bg-[rgba(255,255,255,0.12)]" />

         <div className="build-card-row grid grid-cols-2 gap-[10px] py-[6px]">
            <div className="build-card-left flex min-w-0 flex-1 items-center gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-[rgba(255,255,255,0.72)]">ID:</span>
               <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-extrabold text-[rgba(255,255,255,0.94)]">
                  {item.id}
               </span>
            </div>
            <div className="build-card-right flex min-w-0 flex-1 items-center justify-end gap-[6px]">
               <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-right text-[13px] font-extrabold text-[rgba(255,255,255,0.94)]">
                  {item.created ? `Created: ${item.created}` : "Created:"}
               </span>
            </div>
         </div>

         <div className="build-card-row grid grid-cols-2 gap-[10px] py-[6px]">
            <div className="build-card-left flex min-w-0 flex-1 items-center gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-[rgba(255,255,255,0.72)]">Version:</span>
               <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-right text-[13px] font-extrabold text-[rgba(255,255,255,0.94)]">
                  {item.version != null ? String(item.version) : ""}
               </span>
            </div>
            <div className="build-card-right flex min-w-0 flex-1 items-center justify-end gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-[rgba(255,255,255,0.72)]">Victims:</span>
               <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-right text-[13px] font-extrabold text-[rgba(255,255,255,0.94)]">
                  {item.victims != null ? String(item.victims) : ""}
               </span>
            </div>
         </div>

         <div className="build-card-actions mt-[8px] flex border-t border-t-[rgba(255,255,255,0.12)] pt-[10px]">
            <button
               className="build-card-btn h-[30px] flex-1 cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[12px] font-extrabold text-[rgba(255,255,255,0.92)] transition-[background,border-color,box-shadow] duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(235,200,255,0.26)] focus-visible:outline-none focus-visible:border-[rgba(186,85,211,0.7)] focus-visible:shadow-[0_0_0_3px_rgba(186,85,211,0.22)]"
               type="button"
               onClick={() => {
                  if (!item.id) {
                     showToastSafe("warning", "Missing build id");
                     return;
                  }
                  onDelete(item.id);
               }}
            >
               Delete
            </button>

            <button
               className="build-card-btn ml-[10px] h-[30px] flex-1 cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-[12px] font-extrabold text-[rgba(255,255,255,0.92)] transition-[background,border-color,box-shadow] duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(235,200,255,0.26)] focus-visible:outline-none focus-visible:border-[rgba(186,85,211,0.7)] focus-visible:shadow-[0_0_0_3px_rgba(186,85,211,0.22)]"
               type="button"
               onClick={() => {
                  if (!item.id) {
                     showToastSafe("warning", "Missing build id");
                     return;
                  }
                  onInfo(item.id);
               }}
            >
               Info
            </button>
         </div>
      </div>
   );
}