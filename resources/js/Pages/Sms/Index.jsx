import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { send } from '@/actions/App/Http/Controllers/Web/SmsController';
import { MessageCircle, MessageSquare, Plus, Reply, Megaphone, ChevronDown, ChevronRight, Send, Search } from 'lucide-react';

const directionColors = {
    inbound: 'blue',
    outbound: 'emerald',
};

const channelConfig = {
    sms: { icon: MessageSquare, color: 'blue', label: 'SMS' },
    whatsapp: { icon: MessageCircle, color: 'emerald', label: 'WhatsApp' },
};

const statusIcons = {
    sent: 'text-emerald-500',
    delivered: 'text-emerald-500',
    failed: 'text-red-500',
    read: 'text-blue-500',
};

export default function Index({ messages, conversations, filters, whatsapp_phone_number }) {
    const [showSend, setShowSend] = useState(false);
    const [expandedConv, setExpandedConv] = useState(null);
    const [convMessages, setConvMessages] = useState({});
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [view, setView] = useState('conversations');

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
                router.reload({ only: ['messages', 'conversations'] });
            },
        });
    }

    function openSend(channel = 'sms') {
        setData('channel', channel);
        setShowSend(true);
    }

    async function toggleConversation(contact) {
        if (expandedConv === contact) {
            setExpandedConv(null);
            return;
        }
        setExpandedConv(contact);

        if (!convMessages[contact]) {
            try {
                const res = await fetch(`/sms/conversation/${encodeURIComponent(contact)}`);
                const data = await res.json();
                setConvMessages((prev) => ({ ...prev, [contact]: data }));
            } catch {
                // silent
            }
        }
    }

    async function sendReply(contact) {
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            await fetch(send().url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content },
                body: JSON.stringify({ to: contact, body: replyText, channel: 'sms' }),
            });
            setReplyText('');
            const res = await fetch(`/sms/conversation/${encodeURIComponent(contact)}`);
            const data = await res.json();
            setConvMessages((prev) => ({ ...prev, [contact]: data }));
        } catch {
            // silent
        } finally {
            setSendingReply(false);
        }
    }

    const messagesList = view === 'conversations' ? conversations : messages.data;

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

            <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-white/5">
                    <button onClick={() => setView('conversations')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'conversations' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}>
                        Conversations
                    </button>
                    <button onClick={() => setView('all')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'all' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}>
                        All Messages
                    </button>
                </div>
                {view === 'all' && (
                    <>
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                            <Input className="pl-9" placeholder="Search number or message..." value={filters.search ?? ''} onChange={(e) => router.get('/sms', { search: e.target.value }, { preserveState: true })} />
                        </div>
                        <div className="w-36">
                            <Select value={filters.direction ?? ''} onChange={(e) => router.get('/sms', { direction: e.target.value }, { preserveState: true })}>
                                <option value="">All</option>
                                <option value="inbound">Inbound</option>
                                <option value="outbound">Outbound</option>
                            </Select>
                        </div>
                    </>
                )}
            </div>

            {messagesList.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No messages</p>
                    <Text className="mt-2">Messages will appear here when your number receives texts.</Text>
                </div>
            ) : view === 'conversations' ? (
                <div className="mt-4 space-y-2">
                    {messagesList.map((conv) => (
                        <div key={conv.contact_number} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-white/5">
                            <button onClick={() => toggleConversation(conv.contact_number)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                                <div className="flex items-center gap-3">
                                    {expandedConv === conv.contact_number ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />}
                                    <div>
                                        <span className="font-medium text-zinc-950 dark:text-white">{conv.contact_number}</span>
                                        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">{conv.message_count}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-400">
                                    {new Date(conv.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </button>
                            {expandedConv === conv.contact_number && (
                                <div className="border-t border-zinc-200 px-5 pb-4 pt-3 dark:border-zinc-800">
                                    <div className="max-h-80 space-y-2 overflow-y-auto">
                                        {(convMessages[conv.contact_number] ?? []).map((msg) => {
                                            const ch = channelConfig[msg.channel] || channelConfig.sms;
                                            return (
                                                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                                                        msg.direction === 'outbound'
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                                    }`}>
                                                        <p>{msg.body}</p>
                                                        <div className="mt-1 flex items-center justify-end gap-1.5">
                                                            <span className="text-[10px] opacity-60">
                                                                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {msg.direction === 'outbound' && (
                                                                <span className={`text-[10px] ${statusIcons[msg.status] || 'text-zinc-400'}`}>
                                                                    {msg.status === 'delivered' ? '\u2713\u2713' : msg.status === 'sent' ? '\u2713' : msg.status === 'failed' ? '!' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Input placeholder="Type a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply(conv.contact_number)} />
                                        <Button onClick={() => sendReply(conv.contact_number)} disabled={sendingReply || !replyText.trim()}>
                                            <Send className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Channel</TableHeader>
                                <TableHeader>From</TableHeader>
                                <TableHeader>To</TableHeader>
                                <TableHeader>Message</TableHeader>
                                <TableHeader>Direction</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messagesList.map((msg) => {
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
                                            <span className={`text-sm font-medium capitalize ${statusIcons[msg.status] || 'text-zinc-500'}`}>
                                                {msg.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {messages.links && (
                        <div className="mt-4">
                            <div className="flex items-center gap-1">
                                {messages.links.map((link, i) => {
                                    if (link.url === null) return null;
                                    const label = link.label.replace(/&laquo;|&raquo;|‹|›/g, '').trim();
                                    return (
                                        <Link key={link.url} href={link.url} className={`rounded-md px-3 py-1 text-sm ${link.active ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
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
                            <Select value={data.channel} onChange={(e) => setData('channel', e.target.value)} invalid={errors.channel ? true : undefined}>
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                            </Select>
                            {errors.channel && <ErrorMessage>{errors.channel}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Phone Number</Label>
                            <Input value={data.to} onChange={(e) => setData('to', e.target.value)} placeholder="+12345678900" invalid={errors.to ? true : undefined} />
                            {errors.to && <ErrorMessage>{errors.to}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>Message</Label>
                            <Textarea value={data.body} onChange={(e) => setData('body', e.target.value)} placeholder="Type your message..." rows={4} invalid={errors.body ? true : undefined} />
                            <Text className="mt-1 text-right text-xs text-zinc-500">{data.body.length}/1600</Text>
                            {errors.body && <ErrorMessage>{errors.body}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setShowSend(false)}>Cancel</Button>
                    <Button type="submit" form="send-form" disabled={processing}>{processing ? 'Sending...' : 'Send'}</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
