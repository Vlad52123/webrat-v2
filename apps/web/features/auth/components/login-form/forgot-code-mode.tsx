import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    forgotCode: string;
    setForgotCode: (v: string) => void;
    forgotNewPassword: string;
    setForgotNewPassword: (v: string) => void;
    forgotLoading: boolean;
    handleForgotReset: () => void;
    backToLogin: () => void;
    inputClassName: string;
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
}: Props) {
    return (
        <div className="relative w-full grid justify-items-center">
            <div className="grid w-full gap-[10px] justify-items-center">
                <div className="text-center text-[11px] font-bold uppercase tracking-[3px] text-[rgba(255,255,255,0.45)] mb-[4px]">
                    E N T E R&ensp;C O D E
                </div>

                <div className="grid w-full max-w-[380px] grid-cols-1 gap-2.5">
                    <Input
                        id="forgotCode"
                        type="text"
                        autoComplete="one-time-code"
                        placeholder="verification code"
                        required
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        className={inputClassName}
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
                </div>

                <Button
                    type="button"
                    disabled={forgotLoading || !forgotCode.trim() || !forgotNewPassword.trim()}
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