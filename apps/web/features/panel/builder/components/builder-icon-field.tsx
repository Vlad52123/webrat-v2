export function BuilderIconField() {
    return (
        <div className="builderField">
            <div className="builderLabel text-[13px] font-semibold text-[rgba(255,255,255,0.55)] tracking-[0.2px]">Build icon</div>
            <div className="builderFile mt-[2px] grid grid-cols-[max-content_1fr_max-content] items-center gap-[6px]">
                <input
                    id="buildIcon"
                    className="builderFileInput absolute h-[1px] w-[1px] overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
                    type="file"
                    accept=".ico"
                />
                <button
                    id="buildIconChooseBtn"
                    className="builderFileBtn h-[34px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[14px] text-[12px] font-bold text-[rgba(255,255,255,0.85)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.20)] active:translate-y-[1px]"
                    type="button"
                >
                    Choose .ico
                </button>
                <div
                    id="buildIconName"
                    className="builderFileName grid h-[34px] items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] px-[12px] text-[12px] font-medium text-[rgba(255,255,255,0.45)]"
                >
                    No icon selected
                </div>
                <button
                    id="buildIconClearBtn"
                    className="builderFileClear h-[34px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[14px] text-[12px] font-bold text-[rgba(255,255,255,0.85)] transition-all duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.20)] active:translate-y-[1px]"
                    type="button"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
