import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table'
import { Activity, CheckCircle, XCircle, Clock, ChevronRight, ChevronLeft, Filter } from 'lucide-react'

const statusColors = { success: 'emerald', failed: 'red', pending: 'amber' }
const statusIcons = { success: CheckCircle, failed: XCircle, pending: Clock }

export default function Index({ deliveries, stats, filters = {}, destinations }) {
    const [detail, setDetail] = useState(null)
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '')
    const [eventFilter, setEventFilter] = useState(filters.event ?? '')

    function applyFilter() {
        router.get('/settings/webhooks/deliveries', { status: statusFilter, event: eventFilter }, { preserveState: true })
    }

    function showDetail(d) {
        setDetail(d)
    }

    const StatIcon = statusIcons[stats?.status] || Activity

    return (
        <AuthenticatedLayout>
            <Head title="Webhook Deliveries" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Webhook Deliveries</Heading>
                    <Text className="mt-1">Monitor webhook delivery attempts and responses.</Text>
                </div>
                <Link href="/settings/webhooks">
                    <Button outline>Webhook Destinations</Button>
                </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <Text className="!text-[10px] uppercase tracking-wider text-zinc-500">Total</Text>
                    <p className="mt-1 text-2xl font-bold text-zinc-950">{stats?.total ?? 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <Text className="!text-[10px] uppercase tracking-wider text-emerald-600">Successful</Text>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{stats?.successful ?? 0}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <Text className="!text-[10px] uppercase tracking-wider text-red-600">Failed</Text>
                    <p className="mt-1 text-2xl font-bold text-red-700">{stats?.failed ?? 0}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <Text className="!text-[10px] uppercase tracking-wider text-amber-600">Pending</Text>
                    <p className="mt-1 text-2xl font-bold text-amber-700">{stats?.pending ?? 0}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="w-44">
                    <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); router.get('/settings/webhooks/deliveries', { status: e.target.value, event: eventFilter }, { preserveState: true }) }}>
                        <option value="">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </Select>
                </div>
                <div className="w-44">
                    <Select value={eventFilter} onChange={(e) => { setEventFilter(e.target.value); router.get('/settings/webhooks/deliveries', { status: statusFilter, event: e.target.value }, { preserveState: true }) }}>
                        <option value="">All Events</option>
                        {destinations.flatMap((d) => d.events).filter(Boolean).map((ev) => (
                            <option key={ev} value={ev}>{ev}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white">
                {deliveries.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Activity className="size-10 text-zinc-400" />
                        <p className="mt-4 text-base font-semibold text-zinc-950">No deliveries found</p>
                        <Text className="mt-2">Adjust filters or configure webhooks to see delivery data.</Text>
                    </div>
                ) : (
                    <div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Event</TableHeader>
                                    <TableHeader>Destination</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Attempt</TableHeader>
                                    <TableHeader>Response</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader className="text-right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {deliveries.data.map((d) => {
                                    const Icon = statusIcons[d.status] || Activity
                                    return (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-mono text-xs font-medium">{d.event}</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-xs text-zinc-500">
                                                {d.webhook_destination?.url}
                                            </TableCell>
                                            <TableCell>
                                                <Badge color={statusColors[d.status] || 'zinc'}>{d.status}</Badge>
                                            </TableCell>
                                            <TableCell>{d.attempt}</TableCell>
                                            <TableCell>
                                                {d.response_code ? (
                                                    <span className={`font-mono text-xs ${d.response_code >= 400 ? 'text-red-500' : 'text-zinc-500'}`}>
                                                        {d.response_code}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300">&mdash;</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-zinc-500">
                                                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <button onClick={() => showDetail(d)} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                                                    <ChevronRight className="size-4" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {deliveries.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 border-t border-zinc-200 px-6 py-4">
                                {deliveries.prev_page_url && (
                                    <Link href={deliveries.prev_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
                                        <ChevronLeft className="size-4" /> Previous
                                    </Link>
                                )}
                                {Array.from({ length: deliveries.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/settings/webhooks/deliveries?page=${page}${statusFilter ? `&status=${statusFilter}` : ''}${eventFilter ? `&event=${eventFilter}` : ''}`}
                                        className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                            deliveries.current_page === page ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                {deliveries.next_page_url && (
                                    <Link href={deliveries.next_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
                                        Next <ChevronRight className="size-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={detail !== null} onClose={() => setDetail(null)} size="lg">
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogBody>
                    {detail && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Event</Text>
                                    <p className="mt-0.5 font-mono text-sm">{detail.event}</p>
                                </div>
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</Text>
                                    <div className="mt-0.5">
                                        <Badge color={statusColors[detail.status] || 'zinc'}>{detail.status}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Attempt</Text>
                                    <p className="mt-0.5 text-sm">{detail.attempt}</p>
                                </div>
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Response Code</Text>
                                    <p className="mt-0.5 font-mono text-sm">{detail.response_code ?? '\u2014'}</p>
                                </div>
                            </div>

                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Destination URL</Text>
                                <p className="mt-0.5 break-all text-sm">{detail.webhook_destination?.url}</p>
                            </div>

                            {detail.next_attempt_at && (
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Next Attempt</Text>
                                    <p className="mt-0.5 text-sm">{new Date(detail.next_attempt_at).toLocaleString()}</p>
                                </div>
                            )}

                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payload</Text>
                                <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
                                    {JSON.stringify(detail.payload, null, 2)}
                                </pre>
                            </div>

                            {detail.response_body && (
                                <div>
                                    <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Response Body</Text>
                                    <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
                                        {detail.response_body}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setDetail(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    )
}
