import { Link } from '@inertiajs/react'

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="flex min-h-screen">
            {/* Brand panel */}
            <div className="relative hidden w-2/5 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-12 lg:flex">
                {/* Animated gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />

                {/* Animated sound wave bars */}
                <div className="absolute bottom-1/3 left-1/2 flex -translate-x-1/2 items-end gap-0.5 opacity-20">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 rounded-full bg-white/60"
                            style={{
                                height: `${Math.random() * 60 + 10}px`,
                                animation: `wave ${Math.random() * 2 + 1.5}s ease-in-out infinite alternate`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-violet-500/10 blur-3xl" />

                {/* Brand content */}
                <div className="relative z-10 text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                        <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
                        ZeroVoice
                    </h1>
                    <p className="text-lg text-indigo-200/80">
                        AI-powered voice platform
                    </p>
                </div>

                {/* Bottom quote */}
                <div className="absolute bottom-8 left-8 right-8 z-10 text-center">
                    <p className="text-sm text-indigo-300/50">
                        Build intelligent voice conversations with AI
                    </p>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 items-center justify-center bg-white p-6 dark:bg-zinc-950">
                <div className="w-full max-w-sm animate-[fadeIn_0.6s_ease-out]">
                    <div className="mb-8 sm:mb-10">
                        {/* Mobile brand */}
                        <Link
                            href="/"
                            className="mb-6 flex items-center gap-2 text-base font-semibold text-zinc-950 lg:hidden dark:text-white"
                        >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                                V
                            </div>
                            ZeroVoice
                        </Link>

                        {title && (
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes wave {
                    from { transform: scaleY(0.4); }
                    to { transform: scaleY(1); }
                }
            `}</style>
        </div>
    )
}
