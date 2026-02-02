"use client";

export function RoflSection() {
  return (
    <div className="detail-section">
      <div className="grid gap-[18px]">
        <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
          <div className="p-[6px_2px_2px]">
            <div className="mb-[4px] text-[18px] font-extrabold text-white">Open url</div>
            <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
            <div className="grid grid-cols-[1fr_max-content] gap-[10px]">
              <input className="w-full rounded-[10px] border border-white/15 bg-black/40 px-[10px] py-[8px] text-[15px] text-white outline-none placeholder:text-white/60 focus:border-white/95" placeholder="URL" />
              <button
                className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                style={{ borderBottom: "4px solid var(--line)" }}
              >
                Open
              </button>
            </div>
            <div className="mt-[10px] h-[2px] bg-[var(--line)]" />
          </div>
        </div>

        <div className="w-[420px] max-w-[calc(100vw-420px)] rounded-[18px] border border-white/15 bg-[rgba(30,30,30,0.92)] p-[16px_18px] shadow-[0_18px_44px_rgba(0,0,0,0.82),0_0_0_3px_rgba(255,255,255,0.04)] backdrop-blur-[10px]">
          <div className="p-[6px_2px_2px]">
            <div className="mb-[4px] text-[18px] font-extrabold text-white">Block input</div>
            <div className="mb-[10px] h-[2px] bg-[var(--line)]" />
            <div className="flex gap-[12px]">
              <button
                className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                style={{ borderBottom: "4px solid var(--line)" }}
              >
                Turn on
              </button>
              <button
                className="min-w-[120px] rounded-[12px] border border-white/20 bg-[rgba(30,30,30,0.85)] px-[22px] pb-[4px] pt-[6px] text-[14px] font-extrabold uppercase tracking-[0.05em] text-[#f5f5f5] shadow-[0_10px_24px_rgba(0,0,0,0.7)] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-[1px] hover:bg-[rgba(55,55,55,0.96)] hover:border-white/30 hover:shadow-[0_14px_30px_rgba(0,0,0,0.86)] active:translate-y-0"
                style={{ borderBottom: "4px solid var(--line)" }}
              >
                Turn off
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
