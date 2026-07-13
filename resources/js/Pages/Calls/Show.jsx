import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Textarea } from '@/Components/catalyst/textarea';
import { updateNotes, retry } from '@/actions/App/Http/Controllers/Web/CallController';
import { Phone, Headphones, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusColors = {
    completed: 'emerald',
    failed: 'red',
    busy: 'orange',
    'no-answer': 'zinc',
    cancelled: 'zinc',
    initiated: 'blue',
    ringing: 'blue',
    in_progress: 'amber',
};

const statusIcon = {
    completed: CheckCircle,
    failed: XCircle,
    initiated: Clock,
    in_progress: Clock,
};

export default function CallShow({ call }) {
    const [showTranscript, setShowTranscript] = useState(false);

    const { data, setData, patch, processing } = useForm({
        notes: call.notes ?? '',
    });

    function saveNotes() {
        patch(updateNotes({ call: call.id }).url, {
            preserveScroll: true,
            onSuccess: () => console.log('Notes saved'),
        });
    }

    function handleRetry() {
        router.post(retry({ call: call.id }).url, {}, {
            preserveScroll: true,
        });
    }

    const StatusIcon = statusIcon[call.status] || Phone;

    return (
        <AuthenticatedLayout>
            <Head title={`Call — ${call.call_sid}`} />

            <div className="flex items-center justify-between">
                <div>
                    <Heading>Call Details</Heading>
                    <Text className="mt-1 font-mono text-sm">{call.call_sid}</Text>
                </div>
                <div className="flex items-center gap-2">
                    {call.status !== 'completed' && call.status !== 'failed' && (
                        <Button outline onClick={handleRetry}>
                            <RotateCcw className="size-4" />
                            Retry
                        </Button>
                    )}
                    {call.recording_url && (
                        <a href={`/recordings/${call.id}/play`} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <Headphones className="size-4" />
                                Play Recording
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">Status</Text>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusIcon className="size-5 text-zinc-500" />
                        <Badge color={statusColors[call.status] || 'zinc'}>{call.status.replace('_', ' ')}</Badge>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">Duration</Text>
                    <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                        {call.duration_seconds
                            ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                            : '\u2014'}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">From</Text>
                    <p className="mt-1 text-lg font-medium text-zinc-950 dark:text-white">{call.from_number}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">To</Text>
                    <p className="mt-1 text-lg font-medium text-zinc-950 dark:text-white">{call.to_number}</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-zinc-950 dark:text-white">Transcript</h3>
                        <Button outline onClick={() => setShowTranscript(!showTranscript)}>
                            {showTranscript ? 'Hide' : 'Show'} Transcript
                        </Button>
                    </div>
                    {showTranscript && call.transcripts?.length > 0 ? (
                        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                            {call.transcripts.map((t, i) => (
                                <div key={t.id ?? i} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium capitalize text-zinc-500">{t.speaker ?? 'System'}</span>
                                        <span className="text-xs text-zinc-400">
                                            {t.created_at ? new Date(t.created_at).toLocaleTimeString() : ''}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{t.content ?? t.text ?? t.transcript ?? ''}</p>
                                </div>
                            ))}
                        </div>
                    ) : showTranscript ? (
                        <Text className="mt-4">No transcript available.</Text>
                    ) : null}
                </div>

                <div className="rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white">Call Logs</h3>
                    {call.call_logs?.length > 0 ? (
                        <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                            {call.call_logs.map((log) => (
                                <li key={log.id} className="rounded-lg bg-zinc-50 p-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                    <span className="font-medium capitalize">{log.direction || 'system'}:</span>{' '}
                                    {log.content || log.event || JSON.stringify(log)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text className="mt-4">No logs available.</Text>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white">Flow Context</h3>
                    {call.context ? (
                        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {JSON.stringify(call.context, null, 2)}
                        </pre>
                    ) : (
                        <Text className="mt-4">No context data.</Text>
                    )}
                </div>

                <div className="rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white">Notes</h3>
                    <Textarea
                        className="mt-4"
                        rows={4}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Add notes about this call..."
                    />
                    <div className="mt-3 flex justify-end">
                        <Button onClick={saveNotes} disabled={processing}>
                            {processing ? 'Saving...' : 'Save Notes'}
                        </Button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
