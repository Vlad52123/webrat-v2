import Link from "next/link";

export function LandingNav() {
    return (
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4.5 w-4.5 text-white"
                    >
                        <path d="M6 3h12l4 6-10 13L2 9z" />
                    </svg>
                </div>
                <span className="text-lg font-semibold tracking-tight">WebCrystal</span>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
                <a href="#features" className="transition hover:text-white">Features</a>
                <a href="#how" className="transition hover:text-white">How it works</a>
                <a href="#pricing" className="transition hover:text-white">Pricing</a>
            </nav>
            <Link
                href="/login/"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20"
            >
                Sign in
            </Link>
        </header>
    );
}
