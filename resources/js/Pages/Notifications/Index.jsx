import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Bell, MessageSquare, GitBranch, Users, CreditCard, Server } from 'lucide-react';

const typeIcons = {
    comment: MessageSquare,
    flow_update: GitBranch,
    invite: Users,
    billing: CreditCard,
    system: Server,
};

const typeColors = {
    comment: 'blue',
    flow_update: 'purple',
    invite: 'emerald',
    billing: 'amber',
    system: 'zinc',
};

export default function Index({ notifications }) {
    function markAllRead() {
        router.post('/notifications/mark-all-read');
    }

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Notifications</Heading>
                    <Text className="mt-1">Your recent notifications and updates.</Text>
                </div>
                <Button plain onClick={markAllRead}>Mark all read</Button>
            </div>

            {notifications.data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <Bell className="size-10 text-zinc-400" />
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No notifications</p>
                    <Text className="mt-2">You will see notifications here when team members mention you or flows are updated.</Text>
                </div>
            ) : (
                <div className="mt-6 space-y-2">
                    {notifications.data.map((n) => {
                        const Icon = typeIcons[n.type] || Bell;
                        return (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                                    n.read_at
                                        ? 'border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-900'
                                        : 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/30 dark:bg-indigo-950/20'
                                }`}
                            >
                                <div className={`mt-0.5 rounded-lg p-1.5 bg-${typeColors[n.type] || 'zinc'}-100 dark:bg-${typeColors[n.type] || 'zinc'}-900/30`}>
                                    <Icon className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${n.read_at ? 'text-zinc-700 dark:text-zinc-300' : 'font-medium text-zinc-950 dark:text-white'}`}>
                                        {n.title}
                                    </p>
                                    {n.body && (
                                        <Text className="mt-0.5 text-xs">{n.body}</Text>
                                    )}
                                    <Text className="mt-1 text-xs">
                                        {new Date(n.created_at).toLocaleString()}
                                    </Text>
                                </div>
                                {!n.read_at && <div className="mt-1.5 size-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
