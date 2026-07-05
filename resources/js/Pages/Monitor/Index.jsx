import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { show } from '@/actions/App/Http/Controllers/Web/CallController';

export default function Monitor({ activeCalls: initial }) {
    const [calls, setCalls] = useState(initial ?? []);
    const [now, setNow] = useState(Date.now());
    const intervalRef = useRef(null);

    useEffect(() => {
        function poll() {
            fetch('/monitor/active')
                .then((r) => r.json())
                .then((data) => setCalls(data.calls ?? []))
                .catch(() => {});
        }

        intervalRef.current = setInterval(poll, 5000);

        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    function elapsed(startedAt) {
        const diff = Math.floor((now - new Date(startedAt).getTime()) / 1000);
        if (diff < 0) return '0s';
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return m > 0 ? m + 'm ' + s + 's' : s + 's';
    }

    const statusColors = {
        initiated: 'blue',
        in_progress: 'amber',
        ringing: 'blue',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Live Monitor" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Live Monitor</Heading>
                    <Text className="mt-1">Real-time view of active calls. Refreshes every 5s.</Text>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">Active Calls</Text>
                    <p className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">{calls.length}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">In Progress</Text>
                    <p className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">
                        {calls.filter((c) => c.status === 'in_progress').length}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <Text className="text-sm">Ringing / Initiated</Text>
                    <p className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">
                        {calls.filter((c) => c.status === 'ringing' || c.status === 'initiated').length}
                    </p>
                </div>
            </div>

            {calls.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No active calls</p>
                    <Text className="mt-2">Active calls will appear here in real time.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>From</TableHeader>
                                <TableHeader>To</TableHeader>
                                <TableHeader>Flow</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Elapsed</TableHeader>
                                <TableHeader>Started</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calls.map((call) => (
                                <TableRow key={call.id}>
                                    <TableCell className="font-medium">{call.from_number}</TableCell>
                                    <TableCell>{call.to_number}</TableCell>
                                    <TableCell>{call.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                            <Badge color={statusColors[call.status] || 'zinc'}>
                                                {call.status.replace('_', ' ')}
                                            </Badge>
                                        </span>
                                    </TableCell>
                                    <TableCell>{elapsed(call.started_at)}</TableCell>
                                    <TableCell>
                                        {call.started_at
                                            ? new Date(call.started_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                              })
                                            : '\u2014'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={show({call: call.id}).url}
                                            className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
                                        >
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
