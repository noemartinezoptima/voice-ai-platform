import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/Components/catalyst/description-list';
import { Input } from '@/Components/catalyst/input';
import { index } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const statusColors = {
    pending: 'amber',
    processing: 'blue',
    completed: 'emerald',
    failed: 'red',
};

function chunkWordCount(content) {
    return content.trim().split(/\s+/).filter(Boolean).length;
}

function chunkCharCount(content) {
    return content.length;
}

export default function Show({ document, chunks }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedChunks, setExpandedChunks] = useState({});
    const [reprocessing, setReprocessing] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const filteredChunks = searchQuery
        ? chunks.filter(c => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : chunks;

    function toggleExpand(index) {
        setExpandedChunks(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    }

    async function copyChunk(content, index) {
        await navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }

    function handleReprocess() {
        setReprocessing(true);
        router.post(`/settings/documents/${document.id}/reprocess`, {}, {
            preserveScroll: true,
            onFinish: () => setReprocessing(false),
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
                <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                        <Subheading>Document Info</Subheading>
                        <div className="flex gap-2">
                            <Button plain onClick={handleReprocess} disabled={reprocessing}>
                                {reprocessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Reprocessing...
                                    </span>
                                ) : 'Reprocess'}
                            </Button>
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

                <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <Subheading>Extracted Chunks ({chunks.length})</Subheading>

                    {chunks.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No chunks extracted yet</p>
                            <Text className="mt-1">Document may still be processing or processing failed.</Text>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4">
                                <Input
                                    type="text"
                                    placeholder="Search chunks..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Text className="mt-1">
                                        Found {filteredChunks.length} of {chunks.length} chunks
                                    </Text>
                                )}
                            </div>
                            <div className="mt-4 space-y-3">
                                {filteredChunks.map((chunk) => (
                                    <div
                                        key={chunk.chunk_index}
                                        className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-zinc-400">
                                                    Chunk {chunk.chunk_index + 1}
                                                </span>
                                                <span className="text-xs text-zinc-400">
                                                    {chunkWordCount(chunk.content)} words
                                                </span>
                                                <span className="text-xs text-zinc-400">
                                                    {chunkCharCount(chunk.content)} chars
                                                </span>
                                                {chunk.metadata?.page_number && (
                                                    <span className="text-xs text-zinc-400">
                                                        Page {chunk.metadata.page_number}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => copyChunk(chunk.content, chunk.chunk_index)}
                                                className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            >
                                                {copiedIndex === chunk.chunk_index ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <p
                                            className={`whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 ${
                                                !expandedChunks[chunk.chunk_index] ? 'line-clamp-3' : ''
                                            }`}
                                        >
                                            {chunk.content}
                                        </p>
                                        {chunk.content.length > 300 && (
                                            <button
                                                onClick={() => toggleExpand(chunk.chunk_index)}
                                                className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {expandedChunks[chunk.chunk_index] ? 'Show less' : 'Show more'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
