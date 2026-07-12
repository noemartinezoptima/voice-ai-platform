import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { index, show } from '@/actions/App/Http/Controllers/Web/CallController';

const statusColors = {
    initiated: 'blue',
    in_progress: 'amber',
    completed: 'emerald',
    failed: 'red',
    transferred: 'purple',
};

const stepConfig = {
    say: { label: 'Say', color: 'blue', bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
    ask: { label: 'Ask', color: 'amber', bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
    llm: { label: 'LLM', color: 'purple', bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400' },
    webhook: { label: 'Webhook', color: 'green', bg: 'bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400' },
    transfer: { label: 'Transfer', color: 'orange', bg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' },
    hangup: { label: 'Hangup', color: 'red', bg: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
    condition: { label: 'Condition', color: 'zinc', bg: 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400' },
    knowledge: { label: 'Knowledge', color: 'indigo', bg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' },
    goto: { label: 'Goto', color: 'orange', bg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400' },
};

function relativeTime(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
}

function formatMs(ms) {
    if (!ms) return null;
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
}

function formatDuration(seconds) {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? m + 'm ' + s + 's' : s + 's';
}

function StepIcon({ type, className }) {
    const iconPaths = {
        say: <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />,
        ask: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />,
        llm: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />,
        webhook: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />,
        transfer: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />,
        hangup: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 8.25l-2.25 1.5M8.25 3.75L6 8.25l2.25 1.5M15.75 20.25L18 15.75l-2.25-1.5M8.25 20.25L6 15.75l2.25-1.5M12 12v.01" />,
        condition: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
        knowledge: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
        goto: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />,
    };

    const cfg = stepConfig[type] || { label: type || 'step', color: 'zinc', bg: 'bg-zinc-500/10 text-zinc-500' };

    return (
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {iconPaths[type] || iconPaths.say}
            </svg>
        </span>
    );
}

function WaveformBars() {
    return (
        <div className="flex h-10 items-center justify-center gap-0.5">
            {Array.from({ length: 32 }, (_, i) => {
                const h = 20 + Math.sin((i / 32) * Math.PI * 2) * 18 + Math.random() * 15;
                return (
                    <span
                        key={i}
                        className="w-1 rounded-full bg-blue-500 dark:bg-blue-400"
                        style={{
                            height: h + '%',
                            animation: `waveform-bar 0.8s ease-in-out ${i * 0.06}s infinite alternate`,
                        }}
                    />
                );
            })}
            <style>{`@keyframes waveform-bar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
        </div>
    );
}

function StepTimeline({ steps }) {
    if (!steps || steps.length === 0) {
        return (
            <div className="py-8 text-center">
                <Text className="text-zinc-400">No step data available for this call.</Text>
            </div>
        );
    }

    return (
        <div className="relative mt-4">
            {steps.map((step, i) => {
                const cfg = stepConfig[step.step_type] || { label: step.step_type || 'Step', color: 'zinc', bg: 'bg-zinc-500/10 text-zinc-500' };
                const hasError = step.metadata?.error || step.error;
                const isLast = i === steps.length - 1;

                return (
                    <div key={step.id || i} className="relative flex gap-3 pb-6 last:pb-0">
                        {!isLast && (
                            <span className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
                        )}
                        <div className="relative z-10">
                            <StepIcon type={step.step_type} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge color={cfg.color}>{cfg.label}</Badge>
                                {step.duration_ms != null && step.duration_ms > 0 && (
                                    <span className="text-xs text-zinc-400">{formatMs(step.duration_ms)}</span>
                                )}
                                {hasError && (
                                    <Badge color="red">Error</Badge>
                                )}
                            </div>
                            {step.input && (
                                <div className="mt-1 rounded-md bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    <span className="font-medium text-zinc-400">Input:</span> {step.input}
                                </div>
                            )}
                            {step.output && (
                                <div className="mt-1 rounded-md bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    <span className="font-medium text-zinc-400">Output:</span> {step.output}
                                </div>
                            )}
                            {hasError && (
                                <div className="mt-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                                    <span className="font-medium">Error:</span> {step.metadata?.error || step.error}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Show({ call }) {
    const [showRecording, setShowRecording] = useState(false);

    const transcript = call.context?.transcript;
    const recordingUrl = call.recording_path ? route('recordings.play', call.id) : call.recording_url;
    const hasRecording = call.recording_path || call.recording_url;

    const steps = useMemo(() => {
        if (call.call_logs?.length > 0) {
            return call.call_logs;
        }
        if (call.context?.steps?.length > 0) {
            return call.context.steps;
        }
        return [];
    }, [call.call_logs, call.context]);

    return (
        <AuthenticatedLayout>
            <Head title="Call Details" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Call Details</Heading>
                    <Text className="mt-1">Call SID: {call.call_sid}</Text>
                </div>
                <TextLink href={index().url}>&larr; Back to Calls</TextLink>
            </div>

            <div className="mt-8 max-w-4xl space-y-6">
                <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                    <Subheading>Call Information</Subheading>
                    <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status</dt>
                            <dd className="mt-1">
                                <Badge color={statusColors[call.status] || 'zinc'}>
                                    {call.status.replace('_', ' ')}
                                </Badge>
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Direction</dt>
                            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-950 dark:text-white">
                                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    {call.direction === 'outbound' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    )}
                                </svg>
                                <span className="capitalize">{call.direction || 'inbound'}</span>
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">From</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{call.from_number}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">To</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{call.to_number}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Duration</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{formatDuration(call.duration_seconds)}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Flow</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{call.flow_name || '—'}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Started</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
                                {call.started_at ? new Date(call.started_at).toLocaleString('en-US') : '—'}
                            </dd>
                            <dd className="text-xs text-zinc-400">{relativeTime(call.started_at)}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Ended</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
                                {call.ended_at ? new Date(call.ended_at).toLocaleString('en-US') : '—'}
                            </dd>
                            <dd className="text-xs text-zinc-400">{relativeTime(call.ended_at)}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Current Step</dt>
                            <dd className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{call.current_step || '—'}</dd>
                        </div>
                    </dl>

                    {call.retry_of_id && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                                <span className="text-amber-800 dark:text-amber-200">
                                    This is a retry of{' '}
                                    <Link href={show({ call: call.retry_of_id }).url} className="font-medium underline decoration-amber-400 hover:decoration-amber-600">
                                        Call #{call.retry_of_id.substring(0, 8)}
                                    </Link>
                                </span>
                            </div>
                        </div>
                    )}

                    {call.error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
                            <dt className="text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">Error</dt>
                            <dd className="mt-1 text-sm text-red-700 dark:text-red-400">{call.error}</dd>
                        </div>
                    )}
                </div>

                {steps.length > 0 && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Call Steps</Subheading>
                        <StepTimeline steps={steps} />
                    </div>
                )}

                {hasRecording && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Recording</Subheading>
                        <div className="mt-4 space-y-4">
                            <WaveformBars />
                            <div className="flex flex-wrap items-center gap-3">
                                <Button color="indigo" onClick={() => setShowRecording(true)}>
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Play Recording
                                </Button>
                                {call.duration_seconds > 0 && (
                                    <span className="text-sm text-zinc-500">{formatDuration(call.duration_seconds)}</span>
                                )}
                                <a
                                    href={recordingUrl}
                                    download={`call-${call.call_sid}.wav`}
                                    className="inline-flex items-center gap-x-1.5 rounded-lg border border-zinc-950/10 px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-950/2.5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Download
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {transcript && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Transcript</Subheading>
                        <div className="mt-4 space-y-3">
                            {transcript.map((entry, i) => (
                                <div key={i} className={'flex gap-3 ' + (entry.role === 'agent' ? '' : 'flex-row-reverse')}>
                                    <div className={'rounded-lg px-4 py-2 text-sm ' + (entry.role === 'agent' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900')}>
                                        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                                            {entry.role}
                                        </span>
                                        <p className="mt-0.5">{entry.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={showRecording} onClose={() => setShowRecording(false)}>
                <DialogTitle>Call Recording</DialogTitle>
                <DialogBody>
                    <audio controls className="w-full" autoPlay>
                        <source src={recordingUrl} type="audio/wav" />
                    </audio>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setShowRecording(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
