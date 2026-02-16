export function ToggleRow(props: { id: string; label: string; pressed: boolean; onToggle: () => void }) {
    const { id, label, pressed, onToggle } = props;

    return (
        <div className="my-[10px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.12] bg-white/[0.03] p-[10px]">
            <div className="text-[14px] font-semibold text-white">{label}</div>
            <button
                id={id}
                type="button"
                aria-pressed={pressed}
                className={
                    "relative inline-flex h-[26px] w-[46px] cursor-pointer items-center rounded-full border border-white/40 bg-[rgba(40,40,40,0.9)] transition-colors " +
                    (pressed ? "justify-end bg-gradient-to-br from-[#40d67a] to-[#2abf5a] border-black/60" : "justify-start")
                }
                onClick={onToggle}
            >
                <span
                    className={
                        "h-[20px] w-[20px] rounded-full bg-[#f5f5f5] shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-transform " +
                        (pressed ? "translate-x-[-3px]" : "translate-x-[3px]")
                    }
                />
            </button>
        </div>
    );
}
