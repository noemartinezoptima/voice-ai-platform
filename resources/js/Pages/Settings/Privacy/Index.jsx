import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';

export default function Index({ summary, dataProtection, consentLogs }) {
    return (
        <AuthenticatedLayout>
            <Head title="Privacy &amp; Compliance" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Privacy &amp; Compliance</Heading>
                    <Text className="mt-1">Data summary, consent logs, and compliance tools.</Text>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Total Calls</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_calls}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Users</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_users}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Flows</Text>
                    <p className="mt-1 text-2xl font-semibold">{summary.total_flows}</p>
                </div>
                <div className="rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Text className="text-sm text-zinc-500">Retention</Text>
                    <p className="mt-1 text-2xl font-semibold">{dataProtection?.retention_days ?? 90} days</p>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <Subheading>Data Map</Subheading>
                </div>
                <div className="mt-4 rounded-xl border border-zinc-950/5 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Data Type</TableHeader>
                                <TableHeader>Storage</TableHeader>
                                <TableHeader>Retention</TableHeader>
                                <TableHeader>Encrypted</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Call Recordings</TableCell>
                                <TableCell>Local filesystem</TableCell>
                                <TableCell>{dataProtection?.retention_days ?? 90} days</TableCell>
                                <TableCell><Badge color="emerald">Yes</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Call Logs</TableCell>
                                <TableCell>Database</TableCell>
                                <TableCell>{dataProtection?.retention_days ?? 90} days</TableCell>
                                <TableCell><Badge color="zinc">No</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">User Accounts</TableCell>
                                <TableCell>Database</TableCell>
                                <TableCell>Lifetime</TableCell>
                                <TableCell><Badge color="zinc">No</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Configuration</TableCell>
                                <TableCell>Database (JSON)</TableCell>
                                <TableCell>Lifetime</TableCell>
                                <TableCell><Badge color="emerald">Partial</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="mt-8">
                <Subheading>Actions</Subheading>
                <div className="mt-4 flex gap-4">
                    <Link href="/api/tenant/data/export">
                        <Button>Export Data</Button>
                    </Link>
                    <Link href="/settings/data-protection">
                        <Button outline>Data Protection Settings</Button>
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <Subheading>Recent Consent Activity</Subheading>
                <div className="mt-4">
                    {consentLogs.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
                            <p className="text-base font-semibold text-zinc-950 dark:text-white">No consent events</p>
                            <Text className="mt-2">Consent events will appear here when calls are recorded.</Text>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Event</TableHeader>
                                    <TableHeader>Caller</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consentLogs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <Badge color={log.event === 'consent_granted' ? 'emerald' : 'red'}>
                                                {log.event === 'consent_granted' ? 'Granted' : 'Declined'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.properties?.caller ?? '-'}</TableCell>
                                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
