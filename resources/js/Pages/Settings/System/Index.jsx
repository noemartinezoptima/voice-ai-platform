import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';

export default function SystemIndex({ health, failedJobs, queueDepth, errorRate }) {
    return (
        <AuthenticatedLayout>
            <Head title="System Health" />

            <div>
                <Heading>System Health</Heading>
                <Text className="mt-1">Monitor system services, queues, and error rates.</Text>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Database</Text>
                    <div className="mt-1">
                        <Badge color={health.database === 'ok' ? 'emerald' : 'red'}>
                            {health.database}
                        </Badge>
                    </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Redis</Text>
                    <div className="mt-1">
                        <Badge color={health.redis === 'ok' ? 'emerald' : 'red'}>
                            {health.redis}
                        </Badge>
                    </div>
                </div>
                {queueDepth.map((q) => (
                    <div key={q.queue} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                        <Text className="text-sm">Queue: {q.queue}</Text>
                        <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">{q.size}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Heading level={2}>Error Rate (24h)</Heading>
                <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <p className="text-[28px] font-bold text-zinc-950 dark:text-white">
                        {errorRate.failed} / {errorRate.total}
                        <span className="ml-2 text-lg text-zinc-500">({errorRate.percentage}%)</span>
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <Heading level={2}>Failed Jobs (24h)</Heading>
                {failedJobs.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
                        <Text>No failed jobs in the last 24 hours.</Text>
                    </div>
                ) : (
                    <div className="mt-4">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Connection</TableHeader>
                                    <TableHeader>Queue</TableHeader>
                                    <TableHeader>Exception</TableHeader>
                                    <TableHeader>Failed At</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {failedJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.connection}</TableCell>
                                        <TableCell>{job.queue}</TableCell>
                                        <TableCell className="max-w-xs truncate">{job.exception}</TableCell>
                                        <TableCell>
                                            {new Date(job.failed_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
