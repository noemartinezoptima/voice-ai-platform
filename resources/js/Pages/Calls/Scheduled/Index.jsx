import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';

const frequencyLabels = { once: 'Once', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const statusColors = { pending: 'blue', completed: 'emerald', failed: 'red', cancelled: 'zinc', in_progress: 'amber' };

const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney',
    'Pacific/Auckland',
];

function formatDate(date) {
    if (!date) return '\u2014';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function Index({ calls, flows, stats }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        flow_id: '',
        phone_number: '',
        scheduled_at: '',
        frequency: 'once',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/calls/scheduled', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Scheduled Calls" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Scheduled Calls</Heading>
                    <Text className="mt-1">Schedule outbound calls to run automatically.</Text>
                </div>
                <div className="flex gap-3">
                    <Link href="/calls">
                        <Button outline>Back to Call Logs</Button>
                    </Link>
                    <Button onClick={() => setShowModal(true)}>Schedule Call</Button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm">Pending</Text>
                    <p className="mt-1 text-2xl font-semibold">{stats.pending}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm">Due Today</Text>
                    <p className="mt-1 text-2xl font-semibold">{stats.dueToday}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                    <Text className="text-sm">Completed Today</Text>
                    <p className="mt-1 text-2xl font-semibold">{stats.completedToday}</p>
                </div>
            </div>

            {calls.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No scheduled calls</p>
                    <Text className="mt-2">Schedule your first call to get started.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Flow</TableHeader>
                                <TableHeader>Scheduled At</TableHeader>
                                <TableHeader>Frequency</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader className="text-right">Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calls.data.map((call) => (
                                <TableRow key={call.id}>
                                    <TableCell className="font-medium">{call.phone_number}</TableCell>
                                    <TableCell>{call.flow?.name || '\u2014'}</TableCell>
                                    <TableCell>{formatDate(call.scheduled_at)}</TableCell>
                                    <TableCell>
                                        <Badge color="purple">{frequencyLabels[call.frequency] || call.frequency}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge color={statusColors[call.status] || 'zinc'}>
                                            {call.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {call.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Cancel this scheduled call?')) {
                                                            router.patch(`/calls/scheduled/${call.id}/cancel`);
                                                        }
                                                    }}
                                                    className="text-sm font-medium text-amber-600 underline decoration-amber-600/50 hover:decoration-amber-600 dark:text-amber-400"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {call.status !== 'in_progress' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Delete this scheduled call?')) {
                                                            router.delete(`/calls/scheduled/${call.id}`);
                                                        }
                                                    }}
                                                    className="text-sm font-medium text-red-600 underline decoration-red-600/50 hover:decoration-red-600 dark:text-red-400"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl border border-zinc-950/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900">
                        <Heading>Schedule a Call</Heading>
                        <Text className="mt-1 mb-4">Set up an automated outbound call.</Text>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-950 dark:text-white">Flow</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.flow_id}
                                    onChange={(e) => setData('flow_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a flow...</option>
                                    {flows.map((flow) => (
                                        <option key={flow.id} value={flow.id}>
                                            {flow.name}{flow.phone_number ? ` (${flow.phone_number})` : ''}
                                        </option>
                                    ))}
                                </Select>
                                {errors.flow_id && <Text className="mt-1 text-sm text-red-600">{errors.flow_id}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-950 dark:text-white">Phone Number</label>
                                <Input
                                    className="mt-1 w-full"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    placeholder="+1234567890"
                                    required
                                />
                                {errors.phone_number && <Text className="mt-1 text-sm text-red-600">{errors.phone_number}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-950 dark:text-white">Scheduled At</label>
                                <Input
                                    className="mt-1 w-full"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    required
                                />
                                {errors.scheduled_at && <Text className="mt-1 text-sm text-red-600">{errors.scheduled_at}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-950 dark:text-white">Frequency</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.frequency}
                                    onChange={(e) => setData('frequency', e.target.value)}
                                >
                                    <option value="once">Once</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </Select>
                                {errors.frequency && <Text className="mt-1 text-sm text-red-600">{errors.frequency}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-950 dark:text-white">Timezone</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                >
                                    {timezones.map((tz) => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </Select>
                                {errors.timezone && <Text className="mt-1 text-sm text-red-600">{errors.timezone}</Text>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    outline
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Scheduling...' : 'Schedule Call'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
