export function BuilderStartupDelay(props: {
  delay: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const { delay, onMinus, onPlus } = props;

  return (
    <div className="grid gap-2" role="group" aria-label="Startup delay">
      <span className="text-[12px] font-bold text-white/70">Startup delay (sec)</span>
      <div className="flex h-[38px] overflow-hidden rounded-[12px] border border-white/15 bg-black/30">
        <button
          id="copyMinus"
          className="w-[44px] border-r border-white/10 text-[16px] font-extrabold text-white/80 hover:bg-white/5"
          type="button"
          aria-label="minus"
          onClick={onMinus}
        >
          -
        </button>
        <div id="copyCount" className="flex flex-1 items-center justify-center text-[14px] font-extrabold text-white/90">
          {delay}
        </div>
        <button
          id="copyPlus"
          className="w-[44px] border-l border-white/10 text-[16px] font-extrabold text-white/80 hover:bg-white/5"
          type="button"
          aria-label="plus"
          onClick={onPlus}
        >
          +
        </button>
      </div>
    </div>
  );
}
