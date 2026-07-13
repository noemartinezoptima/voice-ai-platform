import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import HighlightText from '@/Components/HighlightText';

const roleColors = {
    caller: 'blue',
    assistant: 'purple',
    system: 'zinc',
};

const roleLabels = {
    caller: 'Caller',
    assistant: 'Assistant',
    system: 'System',
};

const rolePills = ['', 'caller', 'assistant', 'system'];

export default function Index({ transcripts, stats, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const debouncedApply = useCallback(() => {
        const timer = setTimeout(() => {
            router.get('/transcripts', {
                q: search || undefined,
                role: role || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, role]);

    useEffect(() => {
        return debouncedApply();
    }, [debouncedApply]);

    function handleExport() {
        const params = {};
        if (search) params.q = search;
        if (role) params.role = role;
        window.location.href = '/transcripts/export/csv?' + new URLSearchParams(params).toString();
    }

    return (
        <AuthenticatedLayout>
            <Head title="Transcripts" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Transcripts</Heading>
                    <Text className="mt-1">Search and analyze call transcripts.</Text>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-950/10 p-4 dark:border-white/10">
                    <Text className="text-sm/5">Total Transcripts</Text>
                    <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                        {stats.total_transcripts.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-950/10 p-4 dark:border-white/10">
                    <Text className="text-sm/5">Calls Transcribed</Text>
                    <p className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
                        {stats.calls_with_transcripts.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative flex-1">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <Input
                        className="!pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search transcripts..."
                        aria-label="Search transcripts"
                    />
                </div>
                <div className="flex gap-2">
                    {rolePills.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                role === r
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20'
                            }`}
                        >
                            {r === '' ? 'All' : roleLabels[r]}
                        </button>
                    ))}
                </div>
                <Button outline aria-label="Export CSV" onClick={handleExport}>
                    Export CSV
                </Button>
            </div>

            {transcripts.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No transcripts found</p>
                    <Text className="mt-2">Transcripts will appear here once your calls are processed.</Text>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {transcripts.data.map((transcript) => (
                        <div
                            key={transcript.id}
                            className="rounded-xl border border-zinc-950/10 p-4 dark:border-white/10"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <Link
                                            href={`/calls/${transcript.call_id}`}
                                            className="font-medium text-zinc-950 hover:underline dark:text-white"
                                        >
                                            {transcript.from_number} → {transcript.to_number}
                                        </Link>
                                        {transcript.flow_name && (
                                            <>
                                                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                                                <span>{transcript.flow_name}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <HighlightText
                                            text={transcript.text}
                                            query={search}
                                            className="text-sm text-zinc-700 dark:text-zinc-300"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                                        <Badge color={roleColors[transcript.role] || 'zinc'}>
                                            {roleLabels[transcript.role] || transcript.role}
                                        </Badge>
                                        {transcript.confidence != null && (
                                            <span>Confidence: {(transcript.confidence * 100).toFixed(0)}%</span>
                                        )}
                                        <span>
                                            {new Date(transcript.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {transcripts.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={transcripts.prev_page_url} />
                                <PaginationList>
                                    {transcripts.links.map((link, i) => {
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
                                <PaginationNext href={transcripts.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
