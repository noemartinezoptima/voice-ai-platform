import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';

export default function Index({ messages }) {
    const directionColors = {
        inbound: 'blue',
        outbound: 'emerald',
    };

    return (
        <AuthenticatedLayout>
            <Head title="SMS Messages" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>SMS Messages</Heading>
                    <Text className="mt-1">Incoming and outgoing SMS messages.</Text>
                </div>
            </div>

            {messages.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No messages</p>
                    <Text className="mt-2">SMS messages will appear here when your number receives texts.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>From</TableHeader>
                                <TableHeader>To</TableHeader>
                                <TableHeader>Message</TableHeader>
                                <TableHeader>Direction</TableHeader>
                                <TableHeader>Date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messages.data.map((msg) => (
                                <TableRow key={msg.id}>
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
                            ))}
                        </TableBody>
                    </Table>
                    {messages.links && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationPrevious href={messages.prev_page_url} />
                                <PaginationList>
                                    {messages.links.map((link, i) => {
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
                                <PaginationNext href={messages.next_page_url} />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
