import { useMemo } from "react";

export function BuilderToggle(props: { open: boolean; onToggle: () => void }) {
  const { open, onToggle } = props;

  const toggleText = useMemo(() => (open ? "Hide" : "Create new build"), [open]);

  return (
    <button
      id="builderToggle"
      className="inline-flex h-[44px] items-center justify-center rounded-[14px] border border-white/15 bg-white/5 px-4 text-[14px] font-extrabold text-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md hover:bg-white/10"
      type="button"
      onClick={onToggle}
    >
      <span id="builderToggleText" className="builderToggleText">
        {toggleText}
      </span>
    </button>
  );
}
