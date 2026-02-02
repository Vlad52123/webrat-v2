export function BuilderIconField() {
  return (
    <div className="builderField">
      <div className="builderLabel text-[13px] font-semibold text-[rgba(255,255,255,0.85)]">Build icon</div>
      <div className="builderFile ml-[6px] mt-[3px] grid grid-cols-[max-content_1fr_max-content] items-center gap-[8px]">
        <input
          id="buildIcon"
          className="builderFileInput absolute h-[1px] w-[1px] overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
          type="file"
          accept=".ico"
        />
        <button
          id="buildIconChooseBtn"
          className="builderFileBtn h-[32px] cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.4)] px-[12px] text-[13px] font-bold text-[rgba(255,255,255,0.92)] transition-[border-color,background,box-shadow] duration-[140ms] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.28)] hover:shadow-[0_0_0_3px_rgba(80,230,255,0.1)] focus:outline-none focus:border-[rgba(255,255,255,0.28)] focus:shadow-[0_0_0_3px_rgba(80,230,255,0.12)] active:translate-y-[1px]"
          type="button"
        >
          Choose .ico
        </button>
        <div
          id="buildIconName"
          className="builderFileName grid h-[32px] items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.28)] px-[10px] text-[13px] font-semibold text-[rgba(220,220,220,0.9)]"
        >
          No icon selected
        </div>
        <button
          id="buildIconClearBtn"
          className="builderFileClear h-[32px] cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.4)] px-[12px] text-[13px] font-bold text-[rgba(255,255,255,0.92)] transition-[border-color,background,box-shadow] duration-[140ms] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.28)] hover:shadow-[0_0_0_3px_rgba(80,230,255,0.1)] focus:outline-none focus:border-[rgba(255,255,255,0.28)] focus:shadow-[0_0_0_3px_rgba(80,230,255,0.12)] active:translate-y-[1px]"
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
