import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/Components/catalyst/description-list';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { index } from '@/actions/App/Http/Controllers/Web/CallController';

const statusColors = {
    initiated: 'blue',
    in_progress: 'amber',
    completed: 'emerald',
    failed: 'red',
    transferred: 'purple',
};

export default function Show({ call }) {
    const [showRecording, setShowRecording] = useState(false);
    const transcript = call.context?.transcript;

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
                    <DescriptionList className="mt-4">
                        <DescriptionTerm>Status</DescriptionTerm>
                        <DescriptionDetails>
                            <Badge color={statusColors[call.status] || 'zinc'}>
                                {call.status.replace('_', ' ')}
                            </Badge>
                        </DescriptionDetails>

                        <DescriptionTerm>From</DescriptionTerm>
                        <DescriptionDetails>{call.from_number}</DescriptionDetails>

                        <DescriptionTerm>To</DescriptionTerm>
                        <DescriptionDetails>{call.to_number}</DescriptionDetails>

                        <DescriptionTerm>Duration</DescriptionTerm>
                        <DescriptionDetails>
                            {call.duration_seconds
                                ? Math.floor(call.duration_seconds / 60) + 'm ' + call.duration_seconds % 60 + 's'
                                : '\u2014'}
                        </DescriptionDetails>

                        <DescriptionTerm>Flow</DescriptionTerm>
                        <DescriptionDetails>{call.flow_name || '\u2014'}</DescriptionDetails>

                        <DescriptionTerm>Started</DescriptionTerm>
                        <DescriptionDetails>
                            {call.started_at ? new Date(call.started_at).toLocaleString('en-US') : '\u2014'}
                        </DescriptionDetails>

                        <DescriptionTerm>Ended</DescriptionTerm>
                        <DescriptionDetails>
                            {call.ended_at ? new Date(call.ended_at).toLocaleString('en-US') : '\u2014'}
                        </DescriptionDetails>

                        <DescriptionTerm>Current Step</DescriptionTerm>
                        <DescriptionDetails>{call.current_step || '\u2014'}</DescriptionDetails>

                {call.error && (
                    <>
                        <DescriptionTerm className="text-red-600">Error</DescriptionTerm>
                        <DescriptionDetails className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {call.error}
                        </DescriptionDetails>
                    </>
                )}

                {(call.recording_path || call.recording_url) && (
                    <>
                        <DescriptionTerm>Recording</DescriptionTerm>
                        <DescriptionDetails>
                            <Button onClick={() => setShowRecording(true)}>
                                Play Recording
                            </Button>
                        </DescriptionDetails>
                    </>
                )}
                    </DescriptionList>
                </div>

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
                        <source src={call.recording_path ? route('recordings.play', call.id) : call.recording_url} type="audio/wav" />
                    </audio>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setShowRecording(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
