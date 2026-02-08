import { showToastSafe } from "../../utils/toast";
import type { BuildHistoryItem } from "../../hooks/use-builder-build-history";

export function BuildCard(props: {
   item: BuildHistoryItem;
   onDelete: (id: string) => void;
   onInfo: (id: string) => void;
}) {
   const { item, onDelete, onInfo } = props;

   return (
      <div className="build-card overflow-hidden rounded-[14px] border border-white/[0.12] bg-[rgba(18,18,18,0.52)] shadow-[0_10px_26px_rgba(0,0,0,0.45)]">
         <div className="build-card-header px-[14px] py-[10px] text-[14px] font-extrabold text-white/[0.95]">{item.name || "build"}</div>
         <div className="build-card-separator h-px bg-white/[0.12]" />

         <div className="build-card-row flex items-center justify-between gap-3 px-[14px] py-[10px]">
            <div className="build-card-left flex items-center gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-white/[0.70]">ID:</span>
               <span className="build-card-value text-[12px] font-bold text-white/[0.92]">{item.id}</span>
            </div>
            <div className="build-card-right">
               <span className="build-card-value text-[12px] font-semibold text-white/[0.78]">{item.created ? `Created: ${item.created}` : "Created:"}</span>
            </div>
         </div>

         <div className="build-card-row flex items-center justify-between gap-3 px-[14px] pb-[12px]">
            <div className="build-card-left flex items-center gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-white/[0.70]">Version:</span>
               <span className="build-card-value text-[12px] font-bold text-white/[0.92]">{item.version || ""}</span>
            </div>
            <div className="build-card-right flex items-center gap-[6px]">
               <span className="build-card-label text-[12px] font-bold text-white/[0.70]">Victims:</span>
               <span className="build-card-value text-[12px] font-bold text-white/[0.92]">{typeof item.victims === "number" ? item.victims : ""}</span>
            </div>
         </div>

         <div className="build-card-actions flex items-center gap-[10px] px-[14px] pb-[14px]">
            <button
               className="build-card-btn build-card-btn--danger h-[30px] rounded-[10px] border border-[rgba(255,75,75,0.30)] bg-[rgba(255,75,75,0.08)] px-[12px] text-[12px] font-extrabold text-[#ff7070] transition-[background,border-color,transform] hover:bg-[rgba(255,75,75,0.12)] hover:border-[rgba(255,75,75,0.40)] active:translate-y-[1px]"
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
               className="build-card-btn build-card-btn--info h-[30px] rounded-[10px] border border-white/[0.12] bg-[rgba(20,20,20,0.28)] px-[12px] text-[12px] font-extrabold text-white/[0.92] transition-[background,border-color,transform] hover:bg-white/[0.05] hover:border-white/[0.18] active:translate-y-[1px]"
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