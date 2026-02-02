export function BuilderIconField() {
  return (
    <div className="grid gap-2">
      <span className="text-[12px] font-bold text-white/70">Build icon</span>
      <div className="grid gap-2 rounded-[14px] border border-white/10 bg-black/30 p-3">
        <input id="buildIcon" className="hidden" type="file" accept=".ico" />
        <div className="flex items-center gap-2">
          <button
            id="buildIconChooseBtn"
            className="rounded-[12px] border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
            type="button"
          >
            Choose .ico
          </button>
          <button
            id="buildIconClearBtn"
            className="rounded-[12px] border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
            type="button"
          >
            Clear
          </button>
        </div>
        <div id="buildIconName" className="text-[12px] font-semibold text-white/60">
          No icon selected
        </div>
      </div>
    </div>
  );
}
