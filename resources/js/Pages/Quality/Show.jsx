import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link } from '@inertiajs/react'
import { Heading, Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { index as qualityIndex } from '@/routes/quality'
import { show as callsShow } from '@/actions/App/Http/Controllers/Web/CallController'
import { ArrowLeft, ExternalLink, Headphones, FileText } from 'lucide-react'

const statusColors = {
    completed: 'emerald',
    failed: 'red',
    in_progress: 'amber',
    initiated: 'blue',
    transferred: 'purple',
}

function ScoreCircle({ score, size = 120 }) {
    const r = (size / 2) - 12
    const circ = 2 * Math.PI * r
    const pct = Math.min(score / 100, 1)
    const offset = circ - pct * circ
    const cx = size / 2
    const cy = size / 2
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4e4e7" strokeWidth="8" />
                <circle
                    cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-zinc-400">/ 100</span>
            </div>
        </div>
    )
}

function ScoreBar({ label, score, color }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <Text className="!text-zinc-600">{label}</Text>
                <span className="text-sm font-semibold" style={{ color }}>{score ?? '-'}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score ?? 0}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}

export default function Show({ call, score, transcripts }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Quality Score - ${call.from_number}`} />

            <div className="mb-6 flex items-center gap-4">
                <Link href={qualityIndex().url}>
                    <Button outline>
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <Heading>Call Quality Score</Heading>
                    <Text className="mt-1">
                        {call.from_number} &rarr; {call.to_number}
                    </Text>
                </div>
                <Link href={callsShow({ call: call.id }).url}>
                    <Button outline>
                        <ExternalLink className="size-4" />
                        View Call
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Call Summary */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-6">
                        <Subheading>Call Summary</Subheading>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">Flow</Text>
                                <Text>{call.flow_name || 'N/A'}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">From</Text>
                                <Text>{call.from_number}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">To</Text>
                                <Text>{call.to_number}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">Status</Text>
                                <Badge color={statusColors[call.status] ?? 'zinc'}>
                                    {call.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">Duration</Text>
                                <Text>
                                    {call.duration_seconds
                                        ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                                        : 'N/A'}
                                </Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-zinc-500">Date</Text>
                                <Text>
                                    {call.started_at
                                        ? new Date(call.started_at).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })
                                        : 'N/A'}
                                </Text>
                            </div>
                        </div>

                        {call.recording_url && (
                            <div className="mt-4 border-t border-zinc-100 pt-4">
                                <a
                                    href={call.recording_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                                >
                                    <Headphones className="size-4" />
                                    Listen to Recording
                                    <ExternalLink className="ml-auto size-3 text-zinc-400" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Score + Transcript */}
                <div className="space-y-6 lg:col-span-2">
                    {!score ? (
                        <div className="rounded-xl border border-zinc-950/5 bg-white p-12 text-center">
                            <Text className="text-lg text-zinc-500">No quality score available</Text>
                            <Text className="mt-1 text-sm text-zinc-400">
                                This call hasn't been scored yet. Scores are generated automatically for completed calls.
                            </Text>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xl border border-zinc-950/5 bg-white p-8">
                                <div className="flex flex-col items-center">
                                    <Subheading>Overall Score</Subheading>
                                    <div className="mt-4">
                                        <ScoreCircle score={score.total_score} size={160} />
                                    </div>
                                    <Text className="mt-3 !text-zinc-500">
                                        {score.total_score >= 80 ? 'Excellent' : score.total_score >= 60 ? 'Good' : score.total_score >= 40 ? 'Fair' : 'Needs Improvement'}
                                    </Text>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-950/5 bg-white p-6">
                                <Subheading>Score Breakdown</Subheading>
                                <div className="mt-4 space-y-4">
                                    <ScoreBar label="Politeness" score={score.politeness_score} color="#6366f1" />
                                    <ScoreBar label="Resolution" score={score.resolution_score} color="#3b82f6" />
                                    <ScoreBar label="Duration" score={score.duration_score} color="#22c55e" />
                                    {(score.politeness_score == null || score.politeness_score === 0) && (
                                        <Text className="!text-xs !italic !text-zinc-400">
                                            Politeness score may be 0 when no transcripts are available for sentiment analysis.
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Full Transcript */}
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-6">
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-zinc-400" />
                            <Subheading>Transcript</Subheading>
                            <span className="text-xs text-zinc-400">({transcripts.length} entries)</span>
                        </div>
                        {transcripts.length === 0 ? (
                            <Text className="mt-4 !text-zinc-400">No transcript available.</Text>
                        ) : (
                            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                                {transcripts.map((t, i) => (
                                    <div key={`${t.role}-${i}`} className="rounded-lg bg-zinc-50 p-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <Badge color={t.role === 'user' ? 'blue' : 'emerald'}>
                                                {t.role}
                                            </Badge>
                                            <span className="text-[10px] text-zinc-400">
                                                {new Date(t.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-700">{t.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
