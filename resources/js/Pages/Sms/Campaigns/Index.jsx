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
import { Textarea } from '@/Components/catalyst/textarea';
import { ArrowLeft, Megaphone, Send, Trash2 } from 'lucide-react';

const statusColors = {
    draft: 'zinc',
    sending: 'amber',
    completed: 'emerald',
    failed: 'red',
};

const statusLabels = {
    draft: 'Draft',
    sending: 'Sending',
    completed: 'Completed',
    failed: 'Failed',
};

export default function Index({ campaigns }) {
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        message: '',
        recipients: '',
    });

    const actionForm = useForm({});

    function handleSubmit(e) {
        e.preventDefault();
        post('/sms/campaigns', {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    }

    function handleSend(campaign) {
        actionForm.post(`/sms/campaigns/${campaign.id}/send`, {
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        actionForm.delete(`/sms/campaigns/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="SMS Campaigns" />

            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/sms">
                            <Button outline>
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <Heading>Campaigns</Heading>
                            <Text className="mt-1">Bulk SMS campaigns to multiple recipients.</Text>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Megaphone className="size-4" />
                    New Campaign
                </Button>
            </div>

            {campaigns.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No campaigns</p>
                    <Text className="mt-2">Create a campaign to send bulk SMS messages.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Progress</TableHeader>
                                <TableHeader>Created</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell>
                                        <Badge color={statusColors[campaign.status] || 'zinc'}>
                                            {statusLabels[campaign.status] || campaign.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                                <div
                                                    className="h-2 rounded-full bg-emerald-500 transition-all"
                                                    style={{
                                                        width: campaign.total_count > 0
                                                            ? `${Math.round((campaign.sent_count / campaign.total_count) * 100)}%`
                                                            : '0%',
                                                    }}
                                                />
                                            </div>
                                            <Text className="text-xs">
                                                {campaign.sent_count}/{campaign.total_count}
                                            </Text>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(campaign.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {(campaign.status === 'draft' || campaign.status === 'failed') && (
                                                <Button outline size="sm" onClick={() => handleSend(campaign)}>
                                                    <Send className="size-3" />
                                                </Button>
                                            )}
                                            {campaign.status === 'draft' && (
                                                <Button outline size="sm" onClick={() => setDeleteTarget(campaign)}>
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={showForm} onClose={() => setShowForm(false)} size="md">
                <DialogTitle>New Campaign</DialogTitle>
                <DialogBody>
                    <form id="campaign-form" onSubmit={handleSubmit} className="space-y-4">
                        <Field>
                            <Label>Campaign Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Welcome Campaign"
                                invalid={errors.name ? true : undefined}
                            />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Message</Label>
                            <Textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Campaign message..."
                                rows={4}
                                invalid={errors.message ? true : undefined}
                            />
                            <Text className="mt-1 text-right text-xs text-zinc-500">
                                {data.message.length}/1600
                            </Text>
                            {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Recipients</Label>
                            <Textarea
                                value={data.recipients}
                                onChange={(e) => setData('recipients', e.target.value)}
                                placeholder="+12345678900, +19876543210"
                                rows={4}
                                invalid={errors.recipients ? true : undefined}
                            />
                            <Text className="mt-1 text-xs text-zinc-500">
                                One per line or comma-separated phone numbers
                            </Text>
                            {errors.recipients && <ErrorMessage>{errors.recipients}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" form="campaign-form" disabled={processing}>
                        Save Draft
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
                <DialogTitle>Delete Campaign</DialogTitle>
                <DialogBody>
                    <Text>
                        Delete campaign &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
                    </Text>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={actionForm.processing}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
