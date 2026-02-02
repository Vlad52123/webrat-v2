import { showToastSafe } from "../../utils/toast";
import type { BuildHistoryItem } from "../../hooks/use-builder-build-history";

export function BuildCard(props: {
  item: BuildHistoryItem;
  onDelete: (id: string) => void;
  onInfo: (id: string) => void;
}) {
  const { item, onDelete, onInfo } = props;

  return (
    <div className="build-card overflow-hidden rounded-[14px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
      <div className="build-card-header px-[14px] py-[10px] text-[15px] font-extrabold text-white">{item.name || "build"}</div>
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
          className="build-card-btn build-card-btn--danger h-[30px] rounded-[10px] border border-[rgba(255,75,75,0.35)] bg-[rgba(255,75,75,0.10)] px-[12px] text-[12px] font-extrabold text-[#ff7070] transition-[background,border-color,transform] hover:bg-[rgba(255,75,75,0.16)] hover:border-[rgba(255,75,75,0.45)] active:translate-y-[1px]"
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
          className="build-card-btn build-card-btn--info h-[30px] rounded-[10px] border border-white/[0.14] bg-[rgba(20,20,20,0.35)] px-[12px] text-[12px] font-extrabold text-white/[0.92] transition-[background,border-color,transform] hover:bg-white/[0.06] hover:border-white/[0.22] active:translate-y-[1px]"
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
