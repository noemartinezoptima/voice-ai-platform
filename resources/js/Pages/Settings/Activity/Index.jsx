import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { index as activityIndex } from '@/actions/App/Http/Controllers/Web/ActivityLogController';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LOG_NAMES = [
    { value: '', label: 'All Events' },
    { value: 'security', label: 'Security' },
    { value: 'team', label: 'Team' },
    { value: 'billing', label: 'Billing' },
    { value: 'flow', label: 'Flow' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'document', label: 'Document' },
    { value: 'settings', label: 'Settings' },
];

const EVENT_COLORS = {
    login: 'emerald', logout: 'zinc', login_failed: 'red',
    created: 'emerald', updated: 'blue', deleted: 'red',
    api_token_created: 'emerald', api_token_revoked: 'red',
    plan_changed: 'amber', invite_sent: 'blue', invite_accepted: 'emerald',
    role_changed: 'amber', member_removed: 'red',
};

export default function Index({ activities, filters }) {
    const [logName, setLogName] = useState(filters.log_name || '');
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    function applyFilters() {
        router.get(activityIndex().url, { log_name: logName, search, from, to }, {
            preserveState: true, replace: true,
        });
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') applyFilters();
    }

    return (
        <AuthenticatedLayout>
            <Head title="Activity Log" />
            <div className="flex items-end justify-between">
                <div>
                    <Heading>Activity Log</Heading>
                    <Text className="mt-1">Track changes across your workspace.</Text>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3">
                <div className="min-w-40">
                    <Select value={logName} onChange={(e) => { setLogName(e.target.value); applyFilters(); }}>
                        {LOG_NAMES.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </div>
                <div className="min-w-40">
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="min-w-40">
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="min-w-60 flex-1">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search description..." />
                </div>
                <Button outline onClick={applyFilters}>Search</Button>
            </div>

            {activities.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <Activity className="size-8 text-zinc-400" />
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No activity yet</p>
                    <Text className="mt-2">Activity will appear here as actions are taken.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Time</TableHeader>
                                <TableHeader>User</TableHeader>
                                <TableHeader>Action</TableHeader>
                                <TableHeader>Description</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activities.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="whitespace-nowrap text-sm text-zinc-500" title={item.created_at_exact}>
                                        {item.created_at}
                                    </TableCell>
                                    <TableCell>
                                        {item.causer ? (
                                            <span className="font-medium">{item.causer.name}</span>
                                        ) : (
                                            <span className="text-zinc-400">System</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={EVENT_COLORS[item.event] || 'zinc'}>{item.event}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">{item.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {activities.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1 border-t border-zinc-200 px-6 py-4">
                            {activities.prev_page_url && (
                                <Link href={activities.prev_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
                                    <ChevronLeft className="size-4" /> Previous
                                </Link>
                            )}
                            {Array.from({ length: activities.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`${activityIndex().url}?page=${page}${logName ? `&log_name=${logName}` : ''}${search ? `&search=${search}` : ''}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`}
                                    className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                        activities.current_page === page ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                            {activities.next_page_url && (
                                <Link href={activities.next_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
                                    Next <ChevronRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
