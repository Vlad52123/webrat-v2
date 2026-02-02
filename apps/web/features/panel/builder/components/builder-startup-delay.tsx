export function BuilderStartupDelay(props: {
  delay: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const { delay, onMinus, onPlus } = props;

  return (
    <div className="builderField builderField--two" role="group" aria-label="Startup delay">
      <div className="builderLabel text-[13px] font-semibold text-[rgba(255,255,255,0.85)]">Startup delay (sec)</div>
      <div className="stepper inline-grid grid-cols-[28px_36px_28px] items-center justify-start gap-[6px]">
        <button
          id="copyMinus"
          className="stepperBtn h-[32px] w-[28px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.4)] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.04)]"
          type="button"
          aria-label="minus"
          onClick={onMinus}
        >
          -
        </button>
        <div
          id="copyCount"
          className="stepperValue grid h-[32px] place-items-center rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.4)] text-center text-[rgba(255,255,255,0.9)]"
        >
          {delay}
        </div>
        <button
          id="copyPlus"
          className="stepperBtn h-[32px] w-[28px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.14)] bg-[rgba(20,20,20,0.4)] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.04)]"
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
