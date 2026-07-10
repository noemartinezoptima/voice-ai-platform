import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Badge } from '@/Components/catalyst/badge';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/Components/catalyst/alert';
import { Plus, Pencil, Trash2, GitBranch, Workflow, Copy, Download, Upload } from 'lucide-react';
import { index, create, edit, update, destroy, duplicate } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Index({ flows }) {
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importRef = useRef(null);
    const [importing, setImporting] = useState(false);

    function handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post('/flows/import', formData, {
            onFinish: () => { setImporting(false); if (importRef.current) importRef.current.value = ''; },
        });
    }

    function toggleActive(flow) {
        router.patch(update({flow: flow.id}).url, {
            name: flow.name,
            description: flow.description,
            phone_number: flow.phone_number,
            is_active: !flow.is_active,
        });
    }

    function destroyFlow() {
        if (!confirmingDelete) return;
        const id = confirmingDelete;
        setConfirmingDelete(null);
        router.delete(destroy({flow: id}).url);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Flows" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Flows</Heading>
                    <Text className="mt-1">Manage your voice AI conversation flows.</Text>
                </div>
                <div className="flex gap-2">
                    <input
                        ref={importRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                    <Button plain onClick={() => importRef.current?.click()} disabled={importing}>
                        <Upload className="size-4" />
                        {importing ? 'Importing...' : 'Import'}
                    </Button>
                    <Button href={create().url}>
                        <Plus className="size-4" />
                        New Flow
                    </Button>
                </div>
            </div>

            {flows.data.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                        <GitBranch className="size-6 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <p className="mb-1 text-base font-medium text-zinc-950 dark:text-white">No flows yet</p>
                    <Text className="mb-6">Create your first flow to start building voice AI agents.</Text>
                    <Button href={create().url}>
                        <Plus className="size-4" />
                        Create Flow
                    </Button>
                </div>
            ) : (
                <div className="mt-8">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Version</TableHeader>
                                <TableHeader className="text-right">Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flows.data.map((flow) => (
                                <TableRow key={flow.id}>
                                    <TableCell>
                                        <Link
                                            href={`/flows/${flow.id}`}
                                            className="font-medium text-zinc-950 transition-colors hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
                                        >
                                            {flow.name}
                                        </Link>
                                        {flow.description && (
                                            <div className="text-sm text-zinc-500 dark:text-zinc-400">{flow.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                                        {flow.phone_number || <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            color={flow.is_active ? 'emerald' : 'zinc'}
                                            className="cursor-pointer select-none"
                                            onClick={() => toggleActive(flow)}
                                        >
                                            {flow.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 dark:text-zinc-400">v{flow.version}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button plain href={`/flows/${flow.id}`} title="View flow" aria-label="View flow">
                                                <Workflow className="size-4" />
                                            </Button>
                                            <Button plain href={`/flows/${flow.id}/export`} title="Export flow" aria-label="Export flow">
                                                <Download className="size-4" />
                                            </Button>
                                            <Button plain onClick={() => router.post(duplicate({flow: flow.id}).url)} title="Duplicate flow" aria-label="Duplicate flow">
                                                <Copy className="size-4" />
                                            </Button>
                                            <Button plain href={edit({flow: flow.id}).url} title="Edit flow" aria-label="Edit flow">
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button plain onClick={() => setConfirmingDelete(flow)} title="Delete flow" aria-label="Delete flow">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {flows.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={flows.prev_page_url} />
                                <PaginationList>
                                    {flows.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={i} />;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                        const pageNum = parseInt(label);
                                        if (isNaN(pageNum)) return null;
                                        return (
                                            <PaginationPage
                                                key={i}
                                                href={link.url}
                                                current={link.active}
                                            >
                                                {pageNum}
                                            </PaginationPage>
                                        );
                                    })}
                                </PaginationList>
                                <PaginationNext href={flows.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}

            <Alert open={confirmingDelete !== null} onClose={() => setConfirmingDelete(null)}>
                <AlertTitle>Delete flow?</AlertTitle>
                <AlertDescription>
                    This will permanently delete &ldquo;{confirmingDelete?.name}&rdquo; and all of its configuration. This cannot be undone.
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingDelete(null)}>Cancel</Button>
                    <Button color="red" onClick={destroyFlow}>Delete</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
