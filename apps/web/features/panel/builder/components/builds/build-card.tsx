import { showToastSafe } from "../../utils/toast";
import type { BuildHistoryItem } from "../../hooks/use-builder-build-history";

export function BuildCard(props: {
    item: BuildHistoryItem;
    onDelete: (id: string) => void;
    onInfo: (id: string) => void;
}) {
    const { item, onDelete, onInfo } = props;

    return (
        <div className="build-card min-h-0 rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.72)] p-[16px] pb-[14px] text-[13px] shadow-[0_16px_40px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)_inset] backdrop-blur-[10px]">
            <div className="build-card-header mb-[10px] text-center text-[14px] font-extrabold tracking-[0.3px] text-[rgba(255,255,255,0.92)]">
                {item.name || "build"}
            </div>
            <div className="build-card-separator mb-[10px] h-px bg-[rgba(255,255,255,0.08)]" />

            <div className="build-card-row grid grid-cols-2 gap-[10px] py-[5px]">
                <div className="build-card-left flex min-w-0 flex-1 items-center gap-[6px]">
                    <span className="build-card-label text-[11px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.40)]">ID</span>
                    <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[rgba(255,255,255,0.88)]">
                        {item.id}
                    </span>
                </div>
                <div className="build-card-right flex min-w-0 flex-1 items-center justify-end gap-[6px]">
                    <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-right text-[12px] font-medium text-[rgba(255,255,255,0.50)]">
                        {item.created ? item.created : "—"}
                    </span>
                </div>
            </div>

            <div className="build-card-row grid grid-cols-2 gap-[10px] py-[5px]">
                <div className="build-card-left flex min-w-0 flex-1 items-center gap-[6px]">
                    <span className="build-card-label text-[11px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.40)]">Ver</span>
                    <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[rgba(255,255,255,0.88)]">
                        {item.version != null ? String(item.version) : "—"}
                    </span>
                </div>
                <div className="build-card-right flex min-w-0 flex-1 items-center justify-end gap-[6px]">
                    <span className="build-card-label text-[11px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.40)]">Victims</span>
                    <span className="build-card-value overflow-hidden text-ellipsis whitespace-nowrap text-right text-[13px] font-bold text-[rgba(255,255,255,0.88)]">
                        {item.victims != null ? String(item.victims) : "0"}
                    </span>
                </div>
            </div>

            <div className="build-card-actions mt-[10px] flex gap-[8px] border-t border-t-[rgba(255,255,255,0.08)] pt-[12px]">
                <button
                    className="build-card-btn h-[32px] flex-1 cursor-pointer rounded-[10px] border border-[rgba(255,75,75,0.20)] bg-[rgba(255,75,75,0.06)] text-[12px] font-bold text-[rgba(255,120,120,0.9)] transition-all duration-[140ms] hover:bg-[rgba(255,75,75,0.12)] hover:border-[rgba(255,75,75,0.35)] active:translate-y-[1px]"
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
                    className="build-card-btn h-[32px] flex-1 cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[12px] font-bold text-[rgba(255,255,255,0.80)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.20)] active:translate-y-[1px]"
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
