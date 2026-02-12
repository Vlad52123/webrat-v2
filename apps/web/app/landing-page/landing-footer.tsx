export function LandingFooter() {
    return (
        <footer className="relative z-10 border-t border-white/[0.06] py-10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-white/30 md:flex-row">
                <span>&copy; {new Date().getFullYear()} WebCrystal Inc. All rights reserved.</span>
                <div className="flex gap-6">
                    <a href="#" className="transition hover:text-white/60">Privacy</a>
                    <a href="#" className="transition hover:text-white/60">Terms</a>
                    <a href="#" className="transition hover:text-white/60">Contact</a>
                </div>
            </div>
        </footer>
    );
}
