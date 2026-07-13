import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { index, show, create } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const statusColors = {
    pending: 'amber',
    processing: 'blue',
    completed: 'emerald',
    failed: 'red',
};

export default function Index({ documents, stats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Documents" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Documents</Heading>
                    <Text className="mt-1">Upload documents to build your knowledge base.</Text>
                </div>
                <Link href={create().url}>
                    <Button>Upload Document</Button>
                </Link>
            </div>

            {documents.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="text-base font-semibold text-zinc-950 dark:text-white">No documents</p>
                    <Text className="mt-2">Upload PDFs, images, CSV files, or text documents.</Text>
                    <Link href={create().url} className="mt-4">
                        <Button>Upload Document</Button>
                    </Link>
                </div>
            ) : (
                <>
                    {stats && (
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Documents</p>
                                <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{stats.total_documents}</p>
                            </div>
                            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Chunks</p>
                                <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{stats.total_chunks}</p>
                            </div>
                            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Chunks / Doc</p>
                                <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{stats.avg_chunks_per_doc}</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-6">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Type</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Chunks</TableHeader>
                                    <TableHeader>Uploaded</TableHeader>
                                    <TableHeader className="text-right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.data.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell><Badge color="zinc">{doc.resource_type}</Badge></TableCell>
                                        <TableCell>
                                            <Badge color={statusColors[doc.status] || 'zinc'}>{doc.status}</Badge>
                                        </TableCell>
                                        <TableCell>{doc.chunk_count ?? 0}</TableCell>
                                        <TableCell className="text-zinc-500">
                                            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={show({document: doc.id}).url}
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
                </>
            )}
        </AuthenticatedLayout>
    );
}
