import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';
import { MessageCircle, MessageSquare, Plus, Reply, Megaphone } from 'lucide-react';
import { send } from '@/actions/App/Http/Controllers/Web/SmsController';

const directionColors = {
    inbound: 'blue',
    outbound: 'emerald',
};

const channelConfig = {
    sms: { icon: MessageSquare, color: 'blue', label: 'SMS' },
    whatsapp: { icon: MessageCircle, color: 'emerald', label: 'WhatsApp' },
};

export default function Index({ messages, whatsapp_phone_number }) {
    const [showSend, setShowSend] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
        body: '',
        channel: 'sms',
    });

    function handleSend(e) {
        e.preventDefault();
        post(send().url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSend(false);
                reset();
                router.reload({ only: ['messages'] });
            },
        });
    }

    function openSend(channel = 'sms') {
        setData('channel', channel);
        setShowSend(true);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Messages</Heading>
                    <Text className="mt-1">Incoming and outgoing SMS and WhatsApp messages.</Text>
                    {whatsapp_phone_number && (
                        <div className="mt-2 flex items-center gap-2">
                            <Badge color="emerald">
                                <MessageCircle className="mr-1 size-3" />
                                WhatsApp: {whatsapp_phone_number}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/sms/auto-replies">
                        <Button outline>
                            <Reply className="size-4" />
                            Auto-Replies
                        </Button>
                    </Link>
                    <Link href="/sms/campaigns">
                        <Button outline>
                            <Megaphone className="size-4" />
                            Campaigns
                        </Button>
                    </Link>
                    {whatsapp_phone_number && (
                        <Button outline onClick={() => openSend('whatsapp')}>
                            <MessageCircle className="size-4" />
                            New WhatsApp
                        </Button>
                    )}
                    <Button onClick={() => openSend('sms')}>
                        <Plus className="size-4" />
                        New Message
                    </Button>
                </div>
            </div>

            {messages.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No messages</p>
                    <Text className="mt-2">Messages will appear here when your number receives texts.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Channel</TableHeader>
                                <TableHeader>From</TableHeader>
                                <TableHeader>To</TableHeader>
                                <TableHeader>Message</TableHeader>
                                <TableHeader>Direction</TableHeader>
                                <TableHeader>Date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messages.data.map((msg) => {
                                const ch = channelConfig[msg.channel] || channelConfig.sms;
                                const ChIcon = ch.icon;
                                return (
                                    <TableRow key={msg.id}>
                                        <TableCell>
                                            <Badge color={ch.color}>
                                                <ChIcon className="mr-1 size-3" />
                                                {ch.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{msg.from_number}</TableCell>
                                        <TableCell>{msg.to_number}</TableCell>
                                        <TableCell className="max-w-xs truncate">{msg.body}</TableCell>
                                        <TableCell>
                                            <Badge color={directionColors[msg.direction] || 'zinc'}>
                                                {msg.direction}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {messages.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={messages.prev_page_url} />
                                <PaginationList>
                                    {messages.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={link.label || i} />;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                        const pageNum = parseInt(label);
                                        if (isNaN(pageNum)) return null;
                                        return (
                                            <PaginationPage key={link.url} href={link.url} current={link.active}>
                                                {pageNum}
                                            </PaginationPage>
                                        );
                                    })}
                                </PaginationList>
                                <PaginationNext href={messages.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={showSend} onClose={() => setShowSend(false)} size="md">
                <DialogTitle>Send Message</DialogTitle>
                <DialogBody>
                    <form id="send-form" onSubmit={handleSend} className="space-y-4">
                        <Field>
                            <Label>Channel</Label>
                            <Select
                                value={data.channel}
                                onChange={(e) => setData('channel', e.target.value)}
                                invalid={errors.channel ? true : undefined}
                            >
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                            </Select>
                            {errors.channel && <ErrorMessage>{errors.channel}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{data.channel === 'whatsapp' ? 'WhatsApp Number' : 'Phone Number'}</Label>
                            <Input
                                value={data.to}
                                onChange={(e) => setData('to', e.target.value)}
                                placeholder={data.channel === 'whatsapp' ? '+12345678900' : '+12345678900'}
                                invalid={errors.to ? true : undefined}
                            />
                            {errors.to && <ErrorMessage>{errors.to}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Message</Label>
                            <Textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Type your message..."
                                rows={4}
                                invalid={errors.body ? true : undefined}
                            />
                            <Text className="mt-1 text-right text-xs text-zinc-500">
                                {data.body.length}/{data.channel === 'whatsapp' ? 1600 : 160}
                            </Text>
                            {errors.body && <ErrorMessage>{errors.body}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setShowSend(false)}>Cancel</Button>
                    <Button type="submit" form="send-form" disabled={processing}>
                        {processing ? 'Sending...' : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
