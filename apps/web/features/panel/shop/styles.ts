export const shopClasses = {
   page: "flex h-full w-full flex-col items-start justify-start gap-8 overflow-y-auto pb-12 pt-6 pl-8 pr-8",

   /* top subscription grid */
   grid: "grid w-full gap-6 [grid-template-columns:1fr_280px] max-[900px]:[grid-template-columns:1fr]",

   cardBase:
      "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl",
   cardKey: "flex flex-col items-stretch gap-4",
   cardStatus: "flex flex-col items-center justify-center gap-2",
   cardTitle: "text-base font-semibold tracking-tight text-white/90",

   inputRow: "w-full",
   input:
      "w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-center text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]",

   activateBtn:
      "mt-1 w-full cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-violet-600/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",

   statusTitle:
      "text-2xl font-black tracking-wide",
   statusText: "text-sm font-medium text-white/40",
   statusUntil: "text-lg font-bold text-white/80",

   /* section headers */
   sectionTitle: "relative w-full text-left text-lg font-bold tracking-tight text-white/90",
   sectionTitleLine:
      "pointer-events-none absolute left-[-32px] bottom-[-8px] h-px w-[calc(100%+64px)] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent",

   /* product cards */
   productsGrid:
      "grid w-full gap-5 [grid-template-columns:repeat(3,1fr)] max-[1100px]:[grid-template-columns:repeat(2,1fr)] max-[700px]:[grid-template-columns:1fr]",

   productCard:
      "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02] p-6 transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.08)] hover:translate-y-[-2px]",
   productVip: "mb-1 text-xs font-black uppercase tracking-[0.15em] text-violet-400",
   productPeriod: "mb-1 text-lg font-bold text-white",
   productSubtitle: "mb-4 text-xs text-white/35",
   productPrice: "text-2xl font-black text-emerald-400",

   /* reseller section */
   resellerSection: "w-full",
   resellerSeparator: "my-6 h-px w-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent",
   resellerWarning: "mb-4 text-center text-xs font-bold uppercase tracking-wider text-red-400/80",
   resellerHeader: "mb-5 text-center text-base font-bold text-white/80",
   resellerGrid: "flex flex-wrap justify-center gap-6 pb-6",
   resellerCard:
      "w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 backdrop-blur-xl",
   resellerTitle: "mb-3 text-center text-base font-bold text-white/90",
   resellerLine: "mx-[-4px] mb-4 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent",
   resellerRow:
      "mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm",
   resellerBtn:
      "mt-3 w-full cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:shadow-violet-600/40 hover:brightness-110 active:scale-[0.98]",
} as const;