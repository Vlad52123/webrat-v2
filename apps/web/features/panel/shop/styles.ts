export const shopClasses = {
   page: "flex h-full w-full flex-col items-start justify-start pt-[16px] pl-[32px]",
   grid: "mt-[12px] grid gap-[26px] [grid-template-columns:auto_auto]",

   cardBase:
      "min-h-[200px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] p-[18px] text-center shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]",
   cardKey: "min-w-[360px] flex flex-col items-stretch",
   cardStatus: "min-w-[240px] flex flex-col items-center",
   cardTitle: "mb-[4px] text-[17px] font-[700] text-white",

   inputRow: "w-full",
   input: "w-full rounded-[12px] border border-white/[0.14] bg-[rgba(0,0,0,0.28)] px-[12px] py-[10px] text-center text-[15px] text-white outline-none placeholder:text-[rgba(200,200,200,0.7)] focus:border-white/[0.28]",

   activateBtn:
      "mt-[6px] min-w-[150px] cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]",

   statusTitle:
      "mb-[10px] text-center text-[18px] font-[800] [text-shadow:0_1px_0_rgba(0,0,0,0.65),0_0_6px_rgba(0,0,0,0.55)]",
   statusText: "mb-[8px] text-center text-[15px] font-[600] text-[rgba(200,200,200,0.9)]",
   statusUntil: "mt-[6px] text-center text-[16px] font-[700] text-[rgba(220,220,220,0.96)]",

   sectionTitle: "relative mt-[30px] mb-[14px] w-full text-left text-[18px] font-[800] tracking-[0.02em] text-white/[0.96]",
   sectionTitleLine:
      "pointer-events-none absolute left-[-32px] bottom-[-8px] h-[2px] w-[calc(100%+64px)] opacity-95 [filter:drop-shadow(0_0_10px_rgba(0,0,0,0.85))]",

   productsGrid:
      "grid w-full justify-start justify-items-stretch gap-[22px] [grid-template-columns:repeat(3,minmax(240px,280px))] max-[1200px]:[grid-template-columns:repeat(2,minmax(220px,260px))] max-[880px]:[grid-template-columns:minmax(220px,1fr)]",

   productCard:
      "min-h-[170px] rounded-[18px] border border-white/[0.16] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),rgba(15,15,15,0.84))] px-[18px] py-[14px] text-center shadow-[0_20px_48px_rgba(0,0,0,0.8),0_0_0_4px_rgba(255,255,255,0.10)] backdrop-blur-[10px] transition-[transform,box-shadow,border-color,background] duration-[140ms] hover:translate-y-[-3px] hover:scale-[1.02] hover:border-white/[0.32] hover:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),rgba(15,15,15,0.90))] hover:shadow-[0_24px_56px_rgba(0,0,0,0.85),0_0_0_5px_rgba(255,255,255,0.16)]",
   productVip: "my-[2px] mb-[6px] text-[16px] font-black tracking-[0.02em] text-[#ff3b3b]",
   productPeriod: "mb-[6px] text-[15px] font-extrabold text-white",
   productSubtitle: "mb-[14px] text-[13px] text-[rgba(230,230,230,0.9)]",
   productPrice: "mt-[6px] text-[18px] font-extrabold text-[#4ee97a]",

   resellerSection: "w-full ml-[-32px] overflow-x-hidden",
   resellerSeparator: "my-[26px] mb-[12px] h-[3px] w-full shadow-[0_0_10px_rgba(0,0,0,0.75)]",
   resellerWarning: "mb-[6px] text-center text-[15px] font-extrabold uppercase text-[#ff4a4a]",
   resellerHeader: "mb-[16px] text-center text-[17px] font-bold text-white",
   resellerGrid: "flex flex-wrap justify-center gap-[40px] pb-[24px]",
   resellerCard:
      "min-w-[360px] max-w-[420px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[rgba(18,18,18,0.66)] px-[16px] py-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)] backdrop-blur-[8px]",
   resellerTitle: "mb-[4px] text-center text-[16px] font-bold text-white",
   resellerLine: "mx-[-4px] mt-[4px] mb-[10px] h-[2px] shadow-[0_0_10px_rgba(0,0,0,0.75)]",
   resellerRow:
      "mb-[8px] flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.10] bg-[rgba(0,0,0,0.28)] px-[10px] py-[8px] text-[13px]",
   resellerBtn:
      "mt-auto w-full cursor-pointer rounded-[12px] border border-white/[0.18] border-b-[4px] bg-white/[0.06] px-[12px] py-[10px] text-[13px] font-semibold text-white transition-[background,border-color,transform] hover:bg-white/[0.10] hover:border-white/[0.26] active:translate-y-[1px]",
} as const;
