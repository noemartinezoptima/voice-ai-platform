import { useState, useCallback } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { Activity, CheckCircle, XCircle, Clock, Percent, RotateCcw, ExternalLink, Search } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import MetricCard from '@/Components/MetricCard'
import WebhookDeliveryDrawer from '@/Components/WebhookDeliveryDrawer'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Button } from '@/Components/catalyst/button'
import { Badge } from '@/Components/catalyst/badge'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table'
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination'

const statusColors = { success: 'emerald', failed: 'red', pending: 'amber', dead: 'zinc' }
const statusIcons = { success: CheckCircle, failed: XCircle, pending: Clock, dead: Activity }

export default function Index({ deliveries, stats, successRate, filters = {}, destinations }) {
    const [detail, setDetail] = useState(null)
    const [searchText, setSearchText] = useState(filters.search ?? '')

    const pushFilters = useCallback((overrides) => {
        const next = {
            status: filters.status ?? '',
            event: filters.event ?? '',
            destination_id: filters.destination_id ?? '',
            search: filters.search ?? '',
            ...overrides,
        }
        const params = Object.fromEntries(Object.entries(next).filter(([, v]) => v))
        router.get('/settings/webhooks/deliveries', params, { preserveState: true })
    }, [filters])

    const setFilter = useCallback((key, value) => {
        pushFilters({ [key]: value, page: '' })
    }, [pushFilters])

    const handleSearch = useCallback((e) => {
        e.preventDefault()
        pushFilters({ search: searchText, page: '' })
    }, [searchText, pushFilters])

    const handleRetry = useCallback((e, delivery) => {
        e.stopPropagation()
        router.post(`/settings/webhooks/deliveries/${delivery.id}/retry`, {}, { preserveScroll: true })
    }, [])

    const uniqueEvents = [...new Set(destinations.flatMap((d) => d.events).filter(Boolean))]

    return (
        <AuthenticatedLayout>
            <div data-testid="webhook-deliveries-page">
                <Head title="Webhook Deliveries" />

                <div className="flex items-end justify-between">
                    <div>
                        <Heading>Webhook Deliveries</Heading>
                        <Text className="mt-1">Monitor webhook delivery attempts, responses, and retry failures.</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button outline onClick={() => setFilter('status', 'failed')}>
                            <XCircle className="size-4" />
                            View Failed
                        </Button>
                        <Link href="/settings/webhooks">
                            <Button>
                                <ExternalLink className="size-4" />
                                Destinations
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-5 gap-4" data-testid="kpi-row">
                    <MetricCard
                        label="Total"
                        value={stats?.total ?? 0}
                        icon={Activity}
                        color="zinc"
                        testid="kpi-total"
                    />
                    <MetricCard
                        label="Successful"
                        value={stats?.successful ?? 0}
                        icon={CheckCircle}
                        color="emerald"
                        testid="kpi-successful"
                    />
                    <MetricCard
                        label="Failed"
                        value={stats?.failed ?? 0}
                        icon={XCircle}
                        color="red"
                        testid="kpi-failed"
                    />
                    <MetricCard
                        label="Pending"
                        value={stats?.pending ?? 0}
                        icon={Clock}
                        color="amber"
                        testid="kpi-pending"
                    />
                    <MetricCard
                        label="Success Rate"
                        value={successRate !== null ? `${successRate}%` : '—'}
                        icon={Percent}
                        color={successRate >= 90 ? 'emerald' : successRate >= 50 ? 'amber' : 'red'}
                        subtitle={stats?.total > 0 ? `${stats.successful}/${stats.total}` : undefined}
                        testid="kpi-success-rate"
                    />
                </div>

                <form onSubmit={handleSearch} className="mt-4 flex items-center gap-3" data-testid="filter-bar">
                    <div className="relative w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search event or URL..."
                            className="!pl-9"
                        />
                    </div>
                    <div className="w-40">
                        <Select
                            value={filters.status ?? ''}
                            onChange={(e) => setFilter('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                        </Select>
                    </div>
                    <div className="w-40">
                        <Select
                            value={filters.event ?? ''}
                            onChange={(e) => setFilter('event', e.target.value)}
                        >
                            <option value="">All Events</option>
                            {uniqueEvents.map((ev) => (
                                <option key={ev} value={ev}>{ev}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-52">
                        <Select
                            value={filters.destination_id ?? ''}
                            onChange={(e) => setFilter('destination_id', e.target.value)}
                        >
                            <option value="">All Destinations</option>
                            {destinations.map((d) => (
                                <option key={d.id} value={d.id}>{d.url}</option>
                            ))}
                        </Select>
                    </div>
                    {(filters.status || filters.event || filters.destination_id || filters.search) && (
                        <Button plain onClick={() => {
                            setSearchText('')
                            router.get('/settings/webhooks/deliveries', {}, { preserveState: true })
                        }}>
                            Clear
                        </Button>
                    )}
                </form>

                <div className="mt-6" data-testid="deliveries-table">
                    {deliveries.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
                            <Activity className="size-10 text-zinc-400" />
                            <p className="mt-4 text-base font-semibold text-zinc-950">No deliveries found</p>
                            <Text className="mt-2">
                                {filters.status || filters.event || filters.destination_id || filters.search
                                    ? 'No deliveries match your filters. Try adjusting them.'
                                    : 'Configure a webhook destination to start receiving delivery events.'}
                            </Text>
                            {!filters.status && !filters.event && !filters.destination_id && !filters.search && (
                                <div className="mt-6">
                                    <Link href="/settings/webhooks">
                                        <Button>
                                            <ExternalLink className="size-4" />
                                            Configure Webhook
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-zinc-200 bg-white">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Time</TableHeader>
                                        <TableHeader>Event</TableHeader>
                                        <TableHeader>Destination</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Response</TableHeader>
                                        <TableHeader>Attempts</TableHeader>
                                        <TableHeader className="text-right">Actions</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deliveries.data.map((d) => {
                                        const Icon = statusIcons[d.status] || Activity
                                        return (
                                            <TableRow
                                                key={d.id}
                                                className="cursor-pointer"
                                                onClick={() => setDetail(d)}
                                                data-testid={`delivery-row-${d.id}`}
                                            >
                                                <TableCell className="text-xs text-zinc-500">
                                                    {new Date(d.created_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs font-medium">
                                                    {d.event}
                                                </TableCell>
                                                <TableCell className="max-w-[180px] truncate text-xs text-zinc-500">
                                                    {d.webhook_destination?.url}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge color={statusColors[d.status] || 'zinc'}>{d.status}</Badge>
                                                </TableCell>
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
                                                    {d.attempt}
                                                    {d.next_attempt_at && (
                                                        <span className="ml-1 text-amber-500">*</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {d.status === 'failed' && (
                                                            <Button
                                                                size="sm"
                                                                outline
                                                                onClick={(e) => handleRetry(e, d)}
                                                                data-testid={`retry-btn-${d.id}`}
                                                            >
                                                                <RotateCcw className="size-3" />
                                                                Retry
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>

                            {deliveries.last_page > 1 && (
                                <div className="border-t border-zinc-200 px-6 py-4">
                                    <Pagination>
                                        <PaginationPrevious href={deliveries.prev_page_url} />
                                        <PaginationList>
                                            {deliveries.links.map((link, i) => {
                                                if (link.url === null) return <PaginationGap key={link.label || i} />
                                                const label = link.label.replace(/&laquo;|&raquo;/g, '').trim()
                                                const pageNum = parseInt(label)
                                                if (isNaN(pageNum)) return null
                                                return (
                                                    <PaginationPage key={link.url} href={link.url} current={link.active}>
                                                        {pageNum}
                                                    </PaginationPage>
                                                )
                                            })}
                                        </PaginationList>
                                        <PaginationNext href={deliveries.next_page_url} />
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {detail && (
                    <WebhookDeliveryDrawer delivery={detail} onClose={() => setDetail(null)} />
                )}
            </div>
        </AuthenticatedLayout>
    )
}
