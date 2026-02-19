import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CODE_RE = /^[A-Za-z0-9]*$/;

interface Props {
    forgotCode: string;
    setForgotCode: (v: string) => void;
    forgotNewPassword: string;
    setForgotNewPassword: (v: string) => void;
    forgotLoading: boolean;
    handleForgotReset: () => void;
    backToLogin: () => void;
    inputClassName: string;
    timerLeft: number;
    codeLength: number;
}

function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function ForgotCodeMode({
    forgotCode,
    setForgotCode,
    forgotNewPassword,
    setForgotNewPassword,
    forgotLoading,
    handleForgotReset,
    backToLogin,
    inputClassName,
    timerLeft,
    codeLength,
}: Props) {
    const timerExpired = timerLeft <= 0;

    return (
        <div className="relative w-full grid justify-items-center">
            <div className="grid w-full gap-[10px] justify-items-center">
                <div className="grid w-full max-w-[380px] grid-cols-1 gap-2.5">
                    <Input
                        id="forgotCode"
                        type="text"
                        autoComplete="one-time-code"
                        placeholder="verification code"
                        required
                        maxLength={codeLength}
                        value={forgotCode}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || CODE_RE.test(v)) {
                                setForgotCode(v.slice(0, codeLength));
                            }
                        }}
                        className={inputClassName + " text-center font-mono"}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                    />
                    <Input
                        id="forgotNewPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="new password"
                        required
                        minLength={6}
                        maxLength={24}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className={inputClassName}
                    />
                    <div className={"text-center text-[13px] font-semibold " + (timerExpired ? "text-[#ff5555]" : "text-white/[0.5]")}>
                        {timerExpired ? "Code expired" : formatTime(timerLeft)}
                    </div>
                </div>

                <Button
                    type="button"
                    disabled={forgotLoading || forgotCode.length !== codeLength || !forgotNewPassword.trim() || timerExpired}
                    onClick={handleForgotReset}
                    className="mt-[10px] h-10 w-full max-w-[340px] rounded-full border border-[rgba(214,154,255,0.42)] bg-[rgba(117,61,255,0.82)] text-[18px] font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_16px_42px_rgba(186,85,211,0.22)] transition-[transform,box-shadow,filter,opacity] duration-150 enabled:cursor-pointer hover:bg-[rgba(117,61,255,0.88)] enabled:hover:-translate-y-px enabled:hover:shadow-[0_22px_52px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_22px_56px_rgba(117,61,255,0.24)] enabled:hover:[filter:brightness(1.06)] enabled:active:translate-y-0 enabled:active:[filter:brightness(0.94)] disabled:opacity-60 disabled:cursor-not-allowed disabled:[filter:grayscale(0.15)]"
                >
                    {forgotLoading ? "Resetting..." : "Reset"}
                </Button>

                <button
                    type="button"
                    className="mt-[4px] cursor-pointer select-none text-[14px] font-normal text-[rgba(227,190,255,0.80)] transition-colors duration-150 hover:text-white"
                    onClick={backToLogin}
                >
                    back to login
                </button>
            </div>
        </div>
    );
}
