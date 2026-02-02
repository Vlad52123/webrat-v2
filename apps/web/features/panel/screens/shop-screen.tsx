"use client";

export function ShopScreen() {
  return (
    <div id="shopView" className="h-full overflow-auto">
      <div className="shopPage flex h-full w-full flex-col items-start justify-start pt-[16px] pl-[32px]">
        <div className="shopGrid mt-[12px] grid grid-cols-2 gap-[26px]">
          <div className="shopCard shopCardKey grid min-w-[260px] gap-[10px] rounded-[18px] border border-white/[0.16] bg-[rgba(18,18,18,0.66)] px-[16px] py-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
            <div className="shopCardTitle text-[15px] font-bold text-white/[0.92]">Key activation.</div>
            <div className="shopInputRow">
              <input
                id="shopKeyInput"
                className="shopInput h-[38px] w-full rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] text-center text-[14px] text-white outline-none placeholder:text-[rgba(200,200,200,0.8)] focus:border-white/[0.28]"
                type="text"
                placeholder="key"
                autoComplete="off"
                name="shop-key-input"
              />
            </div>
            <button
              id="shopActivateBtn"
              className="shopActivateBtn h-[36px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.10] px-[22px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.14] hover:border-white/[0.28] active:translate-y-[1px]"
              style={{ borderBottomColor: "var(--line)" }}
              type="button"
            >
              Activate
            </button>
          </div>

          <div className="shopCard shopCardStatus grid min-w-[260px] gap-[10px] rounded-[18px] border border-white/[0.16] bg-[rgba(18,18,18,0.66)] px-[16px] py-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
            <div className="shopCardTitle text-[15px] font-bold text-white/[0.92]">Subscription status.</div>
            <div id="shopStatusTitle" className="shopStatusTitle text-center text-[18px] font-black text-white">
              NONE
            </div>
            <div className="shopStatusText text-center text-[13px] font-semibold text-white/[0.82]">Subscription until</div>
            <div id="shopStatusUntil" className="shopStatusUntil text-center text-[14px] font-bold text-white/[0.92]">
              -
            </div>
          </div>
        </div>

        <div className="shopSectionTitle relative mt-[30px] mb-[14px] w-full text-[18px] font-extrabold tracking-[0.02em] text-white/[0.96]">
          Shop
          <span className="pointer-events-none absolute left-[-32px] bottom-[-8px] h-[2px] w-[calc(100%+64px)] opacity-95 [filter:drop-shadow(0_0_10px_rgba(0,0,0,0.85))]" style={{ background: "var(--line)" }} />
        </div>

        <div className="shopProductsGrid grid grid-cols-3 gap-[22px] justify-start justify-items-stretch">
          {[
            { period: "for a month", subtitle: "Buy WebCrystal for a month", price: "$3,78" },
            { period: "for a year", subtitle: "Buy WebCrystal for a year", price: "$7,58" },
            { period: "forever", subtitle: "Buy WebCrystal forever", price: "$16,43" },
          ].map((p) => (
            <div
              key={p.period}
              className="shopProductCard min-h-[170px] rounded-[18px] border border-white/[0.16] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),rgba(15,15,15,0.84))] px-[18px] py-[14px] text-center shadow-[0_20px_48px_rgba(0,0,0,0.8),0_0_0_4px_rgba(255,255,255,0.10)] backdrop-blur-[10px] transition-[transform,box-shadow,border-color,background] duration-150 hover:translate-y-[-3px] hover:scale-[1.02] hover:border-white/[0.32] hover:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),rgba(15,15,15,0.90))] hover:shadow-[0_24px_56px_rgba(0,0,0,0.85),0_0_0_5px_rgba(255,255,255,0.16)]"
            >
              <div className="shopProductVip mt-[2px] mb-[6px] text-[16px] font-black text-[#ff3b3b]">RATER</div>
              <div className="shopProductPeriod mb-[6px] text-[15px] font-extrabold text-white">{p.period}</div>
              <div className="shopProductSubtitle mb-[14px] text-[13px] text-[rgba(230,230,230,0.9)]">{p.subtitle}</div>
              <div className="shopProductPriceValue mt-[6px] text-[18px] font-extrabold text-[#4ee97a]">{p.price}</div>
            </div>
          ))}
        </div>

        <div className="shopResellerSection w-full ml-[-32px]">
          <div className="shopResellerSeparator my-[26px] mb-[12px] h-[3px] w-full shadow-[0_0_10px_rgba(0,0,0,0.75)]" style={{ background: "var(--line)" }} />
          <div className="shopResellerWarning mb-[6px] text-center text-[15px] font-extrabold uppercase text-[#ff4a4a]">
            DON'T BUY FROM USERS OUTSIDE OF THE OFFICIAL RESELLER LIST, YOU WILL BE SCAMMED.
          </div>
          <div className="shopResellerHeader mb-[16px] text-center text-[17px] font-bold text-white">Official Reseller Contacts</div>

          <div className="shopResellerGrid flex flex-wrap justify-center gap-[40px] pb-[24px]">
            <div className="shopResellerCard min-w-[360px] max-w-[420px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] px-[16px] py-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
              <div className="shopResellerTitle mb-[4px] text-center text-[16px] font-bold text-white">WebCrystalbot</div>
              <div className="shopResellerLine my-[10px] h-px bg-white/[0.18]" />
              <div className="shopResellerRow my-[6px] flex items-center justify-between gap-3">
                <span className="shopResellerLabel text-[13px] font-bold text-white/[0.85]">Contacts:</span>
                <span className="shopResellerValue text-[13px] font-semibold text-white/[0.85]">Telegram: @WebCrystalbot</span>
              </div>
              <div className="shopResellerRow my-[6px] flex items-center justify-between gap-3">
                <span className="shopResellerLabel text-[13px] font-bold text-white/[0.85]">Payment:</span>
                <span className="shopResellerValue text-[13px] font-semibold text-white/[0.85]">Crypto</span>
              </div>
              <button
                className="shopResellerBtn mt-[10px] h-[36px] w-full cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]"
                style={{ borderBottomColor: "var(--line)" }}
                type="button"
                onClick={() => {
                  try {
                    window.open("https://t.me/webcrystalbot", "_blank", "noopener,noreferrer");
                  } catch {
                  }
                }}
              >
                Open telegram
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
