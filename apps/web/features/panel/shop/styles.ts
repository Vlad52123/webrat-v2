export const shopClasses = {
   page: "flex h-full w-full flex-col items-center justify-start pt-[28px] px-[32px] pb-[32px]",
   grid: "mt-[6px] grid gap-[16px] [grid-template-columns:1fr_1fr] w-full max-w-[720px]",

   cardBase:
      "overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.72)] p-[20px] text-center shadow-[0_16px_40px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)_inset] backdrop-blur-[10px]",
   cardKey: "flex flex-col items-stretch",
   cardStatus: "flex flex-col items-center justify-center",
   cardTitle: "mb-[6px] text-[13px] font-bold uppercase tracking-[1px] text-[rgba(255,255,255,0.40)]",

   inputRow: "w-full",
   input: "w-full rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[10px] text-center text-[14px] font-medium text-white outline-none placeholder:text-[rgba(255,255,255,0.25)] transition-[border-color,box-shadow] duration-[160ms] focus:border-[rgba(255,255,255,0.24)] focus:shadow-[0_0_0_3px_rgba(186,85,211,0.08)]",

   activateBtn:
      "mt-[10px] min-w-[140px] cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-[22px] py-[10px] text-[14px] font-extrabold tracking-[0.3px] text-[rgba(255,255,255,0.92)] transition-all duration-[160ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.20)] active:translate-y-[1px] [border-bottom:3px_solid_var(--line)]",

   statusTitle:
      "mb-[6px] text-center text-[22px] font-black tracking-[1px]",
   statusText: "text-center text-[12px] font-medium text-[rgba(255,255,255,0.40)]",
   statusUntil: "mt-[4px] text-center text-[14px] font-bold text-[rgba(255,255,255,0.75)]",

   sectionTitle: "relative mt-[32px] mb-[16px] w-full max-w-[720px] text-center text-[11px] font-bold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.30)]",
   sectionTitleLine:
      "pointer-events-none absolute left-0 bottom-[-8px] h-px w-full bg-[rgba(255,255,255,0.06)]",

   productsGrid:
      "grid w-full max-w-[720px] justify-start gap-[14px] [grid-template-columns:repeat(3,1fr)] max-[1200px]:[grid-template-columns:repeat(2,1fr)] max-[880px]:[grid-template-columns:1fr]",

   productCard:
      "group rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.72)] px-[20px] py-[18px] text-center shadow-[0_12px_32px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)_inset] backdrop-blur-[10px] transition-all duration-[180ms] hover:border-[rgba(255,255,255,0.14)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
   productVip: "mb-[4px] text-[11px] font-black uppercase tracking-[1.2px] text-[rgba(255,75,75,0.80)]",
   productPeriod: "mb-[4px] text-[15px] font-extrabold tracking-[0.2px] text-[rgba(255,255,255,0.92)]",
   productSubtitle: "mb-[12px] text-[12px] font-medium text-[rgba(255,255,255,0.35)]",
   productPrice: "text-[20px] font-black text-[rgba(78,233,122,0.90)]",

   resellerSection: "w-full max-w-[720px] mx-auto mt-[8px]",
   resellerSeparator: "my-[24px] h-px w-full bg-[rgba(255,255,255,0.06)]",
   resellerWarning: "mb-[8px] text-center text-[11px] font-bold uppercase tracking-[0.8px] text-[rgba(255,75,75,0.70)]",
   resellerHeader: "mb-[16px] text-center text-[11px] font-bold uppercase tracking-[1.4px] text-[rgba(255,255,255,0.35)]",
   resellerGrid: "flex flex-wrap justify-center gap-[16px] pb-[24px]",
   resellerCard:
      "w-full max-w-[400px] overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,26,0.72)] px-[18px] py-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)_inset] backdrop-blur-[10px]",
   resellerTitle: "mb-[4px] text-center text-[14px] font-extrabold tracking-[0.2px] text-[rgba(255,255,255,0.92)]",
   resellerLine: "mx-[-4px] mt-[6px] mb-[12px] h-px bg-[rgba(255,255,255,0.06)]",
   resellerRow:
      "mb-[6px] flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-[12px] py-[8px] text-[13px]",
   resellerBtn:
      "mt-[8px] w-full cursor-pointer rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-[12px] py-[10px] text-[13px] font-extrabold tracking-[0.3px] text-[rgba(255,255,255,0.92)] transition-all duration-[160ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.20)] active:translate-y-[1px] [border-bottom:3px_solid_var(--line)]",
} as const;