import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Index({ autoReplies }) {
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        keyword: '',
        reply_text: '',
        match_type: 'contains',
    });

    const toggleForm = useForm({ is_active: false });

    function handleSubmit(e) {
        e.preventDefault();
        if (editingRule) {
            patch(`/sms/auto-replies/${editingRule.id}`, {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowForm(false);
                    setEditingRule(null);
                    reset();
                },
            });
        } else {
            post('/sms/auto-replies', {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    }

    function handleEdit(rule) {
        setEditingRule(rule);
        setData({
            keyword: rule.keyword,
            reply_text: rule.reply_text,
            match_type: rule.match_type,
        });
        setShowForm(true);
    }

    function handleToggle(rule) {
        toggleForm.patch(`/sms/auto-replies/${rule.id}`, {
            is_active: !rule.is_active,
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        toggleForm.delete(`/sms/auto-replies/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function openNew() {
        setEditingRule(null);
        reset();
        setShowForm(true);
    }

    const matchTypeLabels = {
        exact: 'Exact',
        contains: 'Contains',
        starts_with: 'Starts With',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Auto-Replies" />

            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/sms">
                            <Button outline>
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <Heading>Auto-Replies</Heading>
                            <Text className="mt-1">Automatic SMS replies based on keyword matching.</Text>
                        </div>
                    </div>
                </div>
                <Button onClick={openNew}>
                    <Plus className="size-4" />
                    Add Rule
                </Button>
            </div>

            {autoReplies.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No auto-reply rules</p>
                    <Text className="mt-2">Create a rule to automatically respond to incoming messages.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Keyword</TableHeader>
                                <TableHeader>Reply Text</TableHeader>
                                <TableHeader>Match Type</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {autoReplies.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.keyword}</TableCell>
                                    <TableCell className="max-w-xs truncate">{rule.reply_text}</TableCell>
                                    <TableCell>
                                        <Badge color="zinc">{matchTypeLabels[rule.match_type]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleToggle(rule)}
                                            className="cursor-pointer"
                                            type="button"
                                        >
                                            {rule.is_active ? (
                                                <ToggleRight className="size-5 text-emerald-500" />
                                            ) : (
                                                <ToggleLeft className="size-5 text-zinc-400" />
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button outline size="sm" onClick={() => handleEdit(rule)}>
                                                <Pencil className="size-3" />
                                            </Button>
                                            <Button outline size="sm" onClick={() => setDeleteTarget(rule)}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingRule(null); }} size="md">
                <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
                <DialogBody>
                    <form id="auto-reply-form" onSubmit={handleSubmit} className="space-y-4">
                        <Field>
                            <Label>Keyword</Label>
                            <Input
                                value={data.keyword}
                                onChange={(e) => setData('keyword', e.target.value)}
                                placeholder="e.g. HELP, INFO, STOP"
                                invalid={errors.keyword ? true : undefined}
                            />
                            {errors.keyword && <ErrorMessage>{errors.keyword}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Reply Text</Label>
                            <Textarea
                                value={data.reply_text}
                                onChange={(e) => setData('reply_text', e.target.value)}
                                placeholder="Auto-reply message text..."
                                rows={4}
                                invalid={errors.reply_text ? true : undefined}
                            />
                            {errors.reply_text && <ErrorMessage>{errors.reply_text}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Match Type</Label>
                            <Select
                                value={data.match_type}
                                onChange={(e) => setData('match_type', e.target.value)}
                            >
                                <option value="contains">Contains</option>
                                <option value="exact">Exact</option>
                                <option value="starts_with">Starts With</option>
                            </Select>
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => { setShowForm(false); setEditingRule(null); }}>
                        Cancel
                    </Button>
                    <Button type="submit" form="auto-reply-form" disabled={processing}>
                        {editingRule ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
                <DialogTitle>Delete Rule</DialogTitle>
                <DialogBody>
                    <Text>
                        Delete the auto-reply rule for keyword &ldquo;{deleteTarget?.keyword}&rdquo;? This cannot be undone.
                    </Text>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={toggleForm.processing}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
