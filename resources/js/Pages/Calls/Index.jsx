import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { index, show } from '@/actions/App/Http/Controllers/Web/CallController';

export default function Index({ calls, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters() {
        router.get(index().url, {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }

    function formatDuration(seconds) {
        if (!seconds) return '\u2014';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? m + 'm ' + s + 's' : s + 's';
    }

    const statusColors = {
        initiated: 'blue',
        in_progress: 'amber',
        completed: 'emerald',
        failed: 'red',
        transferred: 'purple',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Call Logs" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Call Logs</Heading>
                    <Text className="mt-1">Monitor and review all voice calls.</Text>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative flex-1">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <Input
                        className="!pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search phone number or SID..."
                    />
                </div>
                <div className="w-40">
                    <Select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setTimeout(applyFilters, 0); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="initiated">Initiated</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="transferred">Transferred</option>
                    </Select>
                </div>
                <Button
                    outline
                    onClick={() => {
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (status) params.set('status', status);
                        window.location.href = '/calls/export/csv?' + params.toString();
                    }}
                >
                    Export CSV
                </Button>
            </div>

            {calls.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No calls found</p>
                    <Text className="mt-2">Calls will appear here once your voice agents start receiving them.</Text>
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
                                <TableHeader>Duration</TableHeader>
                                <TableHeader>Date</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calls.data.map((call) => (
                                <TableRow key={call.id}>
                                    <TableCell className="font-medium">{call.from_number}</TableCell>
                                    <TableCell>{call.to_number}</TableCell>
                                    <TableCell>{call.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                                    <TableCell>
                                        <Badge color={statusColors[call.status] || 'zinc'}>
                                            {call.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                                    <TableCell>
                                        {call.started_at
                                            ? new Date(call.started_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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
                    {calls.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={calls.prev_page_url} />
                                <PaginationList>
                                    {calls.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={i} />;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                        const pageNum = parseInt(label);
                                        if (isNaN(pageNum)) return null;
                                        return (
                                            <PaginationPage key={i} href={link.url} current={link.active}>
                                                {pageNum}
                                            </PaginationPage>
                                        );
                                    })}
                                </PaginationList>
                                <PaginationNext href={calls.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
