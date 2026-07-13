import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationPrevious, PaginationNext, PaginationList, PaginationPage } from '@/Components/catalyst/pagination';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const filters = [
    { key: 'all', label: 'All' },
    { key: 'unresolved', label: 'Unresolved' },
    { key: 'resolved', label: 'Resolved' },
];

function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="size-4 text-zinc-400" />}
                <Text className="text-sm">{label}</Text>
            </div>
            <p className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-white">{value}</p>
        </div>
    );
}

export default function Index({ errors, stats, filter }) {
    function resolve(hash) {
        router.patch(`/settings/errors/${hash}/resolve`, {}, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Error Tracking" />

            <div>
                <Heading>Error Tracking</Heading>
                <Text className="mt-1">Monitor and manage application errors.</Text>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Errors" value={stats.total} icon={AlertTriangle} />
                <StatCard label="Unresolved" value={stats.unresolved} icon={AlertTriangle} />
                <StatCard label="Today" value={stats.today} icon={Clock} />
                <StatCard label="This Week" value={stats.this_week} icon={Clock} />
            </div>

            <div className="mt-6 flex items-center gap-2">
                {filters.map((f) => (
                    <Link
                        key={f.key}
                        href={`/settings/errors?filter=${f.key}`}
                        preserveScroll
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filter === f.key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10'
                        }`}
                    >
                        {f.label}
                    </Link>
                ))}
            </div>

            {errors.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <CheckCircle2 className="size-8 text-emerald-400" />
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No errors found</p>
                    <Text className="mt-2">All clear. No errores match this filter.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Error Class</TableHeader>
                                <TableHeader>Message</TableHeader>
                                <TableHeader>File : Line</TableHeader>
                                <TableHeader>Occurrences</TableHeader>
                                <TableHeader>Last Seen</TableHeader>
                                <TableHeader />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {errors.data.map((err) => (
                                <TableRow key={err.hash}>
                                    <TableCell>
                                        <Badge color="red">{err.class.replace(/^.*\\/, '')}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{err.message}</TableCell>
                                    <TableCell className="whitespace-nowrap text-sm text-zinc-500">
                                        {err.file.replace(/^.*\//, '')}:{err.line}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{err.occurrence_count}</TableCell>
                                    <TableCell className="whitespace-nowrap text-sm text-zinc-500">
                                        {new Date(err.last_seen_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/settings/errors/${err.hash}`}
                                                className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                                            >
                                                Details
                                            </Link>
                                            {!err.resolved_at && (
                                                <Button plain size="sm" onClick={() => resolve(err.hash)}>
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {errors.last_page > 1 && (
                        <Pagination className="mt-6">
                            {errors.current_page > 1 && (
                                <PaginationPrevious href={`/settings/errors?page=${errors.current_page - 1}&filter=${filter}`} />
                            )}
                            <PaginationList>
                                {Array.from({ length: errors.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationPage
                                        key={page}
                                        href={`/settings/errors?page=${page}&filter=${filter}`}
                                        current={page === errors.current_page}
                                    >
                                        {page}
                                    </PaginationPage>
                                ))}
                            </PaginationList>
                            {errors.current_page < errors.last_page && (
                                <PaginationNext href={`/settings/errors?page=${errors.current_page + 1}&filter=${filter}`} />
                            )}
                        </Pagination>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
