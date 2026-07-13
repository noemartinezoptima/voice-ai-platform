import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/Components/catalyst/description-list';
import { index } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const statusColors = {
    pending: 'amber',
    processing: 'blue',
    completed: 'emerald',
    failed: 'red',
};

export default function Show({ document, chunks }) {
    function reProcess() {
        router.post(`/settings/documents/${document.id}/reprocess`, {}, {
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (confirm('Delete this document and its chunks?')) {
            router.delete(`/settings/documents/${document.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title={document.name} />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>{document.name}</Heading>
                    <Text className="mt-1">Document details and extracted chunks.</Text>
                </div>
                <TextLink href={index().url}>&larr; Back to Documents</TextLink>
            </div>

            <div className="mt-8 max-w-4xl space-y-6">
                <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                        <Subheading>Document Info</Subheading>
                        <div className="flex gap-2">
                            <Button plain onClick={reProcess}>Reprocess</Button>
                            <Button plain color="red" onClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                    <DescriptionList className="mt-4">
                        <DescriptionTerm>Type</DescriptionTerm>
                        <DescriptionDetails><Badge color="zinc">{document.resource_type}</Badge></DescriptionDetails>
                        <DescriptionTerm>Status</DescriptionTerm>
                        <DescriptionDetails>
                            <Badge color={statusColors[document.status] || 'zinc'}>{document.status}</Badge>
                        </DescriptionDetails>
                        <DescriptionTerm>MIME Type</DescriptionTerm>
                        <DescriptionDetails>{document.mime_type || '\u2014'}</DescriptionDetails>
                        <DescriptionTerm>Chunks</DescriptionTerm>
                        <DescriptionDetails>{chunks.length}</DescriptionDetails>
                        <DescriptionTerm>Uploaded</DescriptionTerm>
                        <DescriptionDetails>{new Date(document.created_at).toLocaleString('en-US')}</DescriptionDetails>
                        {document.status === 'failed' && document.error && (
                            <>
                                <DescriptionTerm className="text-red-600">Error</DescriptionTerm>
                                <DescriptionDetails className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                    {document.error}
                                </DescriptionDetails>
                            </>
                        )}
                    </DescriptionList>
                </div>

                {chunks.length > 0 && (
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Extracted Chunks ({chunks.length})</Subheading>
                        <div className="mt-4 space-y-3">
                            {chunks.map((chunk, i) => (
                                <div
                                    key={chunk.chunk_index}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
                                >
                                    <span className="mb-1 block text-xs font-semibold text-zinc-400">
                                        Chunk {chunk.chunk_index + 1}
                                    </span>
                                    <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                                        {chunk.content}
                                    </p>
                                    {chunk.metadata && chunk.metadata.page_number && (
                                        <span className="mt-1 block text-xs text-zinc-400">
                                            Page {chunk.metadata.page_number}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
