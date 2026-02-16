export function BuilderStartupDelay(props: {
    delay: number;
    onMinus: () => void;
    onPlus: () => void;
}) {
    const { delay, onMinus, onPlus } = props;

    return (
        <div className="builderField builderField--two" role="group" aria-label="Startup delay">
            <div className="builderLabel text-[13px] font-semibold text-[rgba(255,255,255,0.55)] tracking-[0.2px]">Startup delay (sec)</div>
            <div className="stepper inline-grid grid-cols-[32px_40px_32px] items-center justify-start gap-[4px]">
                <button
                    id="copyMinus"
                    className="stepperBtn h-[34px] w-[32px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[14px] font-bold text-[rgba(255,255,255,0.7)] transition-[background,border-color,color] duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:text-white active:translate-y-[1px]"
                    type="button"
                    aria-label="minus"
                    onClick={onMinus}
                >
                    −
                </button>
                <div
                    id="copyCount"
                    className="stepperValue grid h-[34px] place-items-center rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-center text-[13px] font-bold text-[rgba(255,255,255,0.92)]"
                >
                    {delay}
                </div>
                <button
                    id="copyPlus"
                    className="stepperBtn h-[34px] w-[32px] cursor-pointer rounded-[10px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[14px] font-bold text-[rgba(255,255,255,0.7)] transition-[background,border-color,color] duration-[140ms] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:text-white active:translate-y-[1px]"
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
