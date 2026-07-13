import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { AlertTriangle, Calendar, Clock, FileCode, Hash, MessageSquare } from 'lucide-react';

export default function Show({ error }) {
    function resolve() {
        router.patch(`/settings/errors/${error.hash}/resolve`, {}, {
            onSuccess: () => router.visit('/settings/errors'),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Error: ${error.class.replace(/^.*\\/, '')}`} />

            <div className="mb-6">
                <Link href="/settings/errors" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                    &larr; Back to Errors
                </Link>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <Badge color="red" className="mb-2">{error.class.replace(/^.*\\/, '')}</Badge>
                    <Heading className="mt-2">{error.message}</Heading>
                </div>
                <div>
                    {error.resolved_at ? (
                        <Badge color="emerald">Resolved</Badge>
                    ) : (
                        <Button onClick={resolve}>Resolve</Button>
                    )}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <FileCode className="size-4 text-zinc-400" />
                        <Text className="text-sm font-medium">Location</Text>
                    </div>
                    <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">
                        {error.file}:{error.line}
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <Hash className="size-4 text-zinc-400" />
                        <Text className="text-sm font-medium">Exception Class</Text>
                    </div>
                    <p className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-300">{error.class}</p>
                </div>

                <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-zinc-400" />
                        <Text className="text-sm font-medium">Occurrences</Text>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
                        {error.occurrence_count}
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-zinc-400" />
                        <Text className="text-sm font-medium">Timeline</Text>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                        <p><span className="font-medium">First seen:</span> {new Date(error.first_seen_at).toLocaleString()}</p>
                        <p><span className="font-medium">Last seen:</span> {new Date(error.last_seen_at).toLocaleString()}</p>
                        {error.resolved_at && (
                            <p><span className="font-medium">Resolved:</span> {new Date(error.resolved_at).toLocaleString()}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-zinc-400" />
                    <Text className="text-sm font-medium">Full Message</Text>
                </div>
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-zinc-600 dark:text-zinc-300">
                    {error.message}
                </pre>
            </div>
        </AuthenticatedLayout>
    );
}
