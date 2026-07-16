export default function MetricCard({ label, value, icon: Icon, color = 'zinc', trend, subtitle, testid }) {
    const colors = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        red: 'border-red-200 bg-red-50 text-red-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        zinc: 'border-zinc-200 bg-white text-zinc-950',
        indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    }

    return (
        <div className={`rounded-xl border p-4 ${colors[color] || colors.zinc}`} data-testid={testid}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{value ?? '—'}</p>
                    {subtitle && (
                        <p className="mt-0.5 text-xs opacity-60">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/5">
                        <Icon className="size-5 opacity-60" />
                    </div>
                )}
            </div>
            {trend !== undefined && (
                <div className={`mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </div>
            )}
        </div>
    )
}
