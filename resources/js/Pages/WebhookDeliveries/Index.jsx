import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Select } from '@/Components/catalyst/select';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { Webhook, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const statusColors = {
    success: 'emerald',
    failed: 'red',
    pending: 'amber',
};

const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    pending: Clock,
};

export default function WebhookDeliveries({ deliveries, stats, filters, destinations }) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    return (
        <AuthenticatedLayout>
            <Head title="Webhook Deliveries" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Webhook Deliveries</Heading>
                    <Text className="mt-1">Monitor outbound webhook delivery status and history.</Text>
                </div>
                <Link href="/settings/webhooks">
                    <Button outline>
                        <Webhook className="size-4" />
                        Manage Webhooks
                    </Button>
                </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Total Deliveries</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">{stats?.total ?? 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <Text className="text-sm text-emerald-700 dark:text-emerald-300">Successful</Text>
                    <p className="mt-1 text-3xl font-semibold text-emerald-700 dark:text-emerald-300">{stats?.successful ?? 0}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/20">
                    <Text className="text-sm text-red-700 dark:text-red-300">Failed</Text>
                    <p className="mt-1 text-3xl font-semibold text-red-700 dark:text-red-300">{stats?.failed ?? 0}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <Text className="text-sm text-amber-700 dark:text-amber-300">Pending</Text>
                    <p className="mt-1 text-3xl font-semibold text-amber-700 dark:text-amber-300">{stats?.pending ?? 0}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="w-44">
                    <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); router.get('/settings/webhooks/deliveries', { status: e.target.value }, { preserveState: true }); }}>
                        <option value="">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </Select>
                </div>
                <Button outline onClick={() => window.location.reload()}>
                    <RefreshCw className="size-4" />
                    Refresh
                </Button>
            </div>

            {deliveries.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No deliveries recorded</p>
                    <Text className="mt-2">Deliveries appear when webhooks are dispatched to your destinations.</Text>
                </div>
            ) : (
                <div className="mt-4">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Event</TableHeader>
                                <TableHeader>Destination</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Response</TableHeader>
                                <TableHeader>Attempt</TableHeader>
                                <TableHeader>Date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deliveries.data.map((d) => {
                                const StatusIcon = statusIcons[d.status] || Clock;
                                return (
                                    <TableRow key={d.id}>
                                        <TableCell>
                                            <Badge>{d.event}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate font-mono text-xs">
                                            {d.webhook_destination?.url ?? d.webhook_destination_id}
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-2">
                                                <StatusIcon className={`size-4 ${
                                                    d.status === 'success' ? 'text-emerald-500' :
                                                    d.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                                                }`} />
                                                <Badge color={statusColors[d.status] || 'zinc'}>{d.status}</Badge>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {d.response_code ? (
                                                <Badge color={d.response_code < 300 ? 'emerald' : d.response_code < 500 ? 'amber' : 'red'}>
                                                    {d.response_code}
                                                </Badge>
                                            ) : '\u2014'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-zinc-500">#{d.attempt}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-zinc-500">
                                                {new Date(d.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {deliveries.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={deliveries.prev_page_url} />
                                <PaginationList>
                                    {deliveries.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={link.label || i} />;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                        const pageNum = parseInt(label);
                                        if (isNaN(pageNum)) return null;
                                        return (
                                            <PaginationPage key={link.url} href={link.url} current={link.active}>
                                                {pageNum}
                                            </PaginationPage>
                                        );
                                    })}
                                </PaginationList>
                                <PaginationNext href={deliveries.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
