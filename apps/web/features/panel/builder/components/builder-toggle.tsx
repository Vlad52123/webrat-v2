import { useMemo } from "react";

export function BuilderToggle(props: { open: boolean; onToggle: () => void }) {
    const { open, onToggle } = props;

    const toggleText = useMemo(() => (open ? "Close builder" : "Create new build"), [open]);

    return (
        <button
            id="builderToggle"
            className={
                "builderToggle relative w-full cursor-pointer appearance-none rounded-[14px] border bg-[rgba(22,22,26,0.5)] px-[14px] py-[10px] text-center text-[15px] font-bold tracking-[0.3px] transition-all duration-[180ms] active:translate-y-[1px] " +
                (open
                    ? "border-[rgba(255,255,255,0.14)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.18)]"
                    : "border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.92)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.20)]")
            }
            type="button"
            onClick={onToggle}
        >
            <span id="builderToggleText" className="builderToggleText">
                {toggleText}
            </span>
        </button>
    );
}
