import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { MessageSquare, Users, GitBranch, User, Radio } from 'lucide-react';

const iconMap = {
    comment: MessageSquare,
    invite: Users,
    role_change: Users,
    flow_update: GitBranch,
    voice_cloned: Radio,
};

const actionColors = {
    comment: 'blue',
    invite: 'emerald',
    role_change: 'amber',
    flow_update: 'purple',
    voice_cloned: 'indigo',
};

const MAX_ITEMS = 10;

export default function ActivityFeed() {
    const tenantId = usePage().props.auth.user?.tenant_id;
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!window.Echo || !tenantId) return;

        try {
            const channel = window.Echo.channel(`tenant.${tenantId}.activity`);

            channel.listen('.team.activity', (event) => {
                setEvents((prev) => [{ ...event, id: Date.now().toString() }, ...prev.slice(0, MAX_ITEMS - 1)]);
            });

        } catch { /* Echo not available */ }
    }, [tenantId]);

    if (events.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Team Activity</h3>
            <div className="space-y-2">
                {events.map((e) => {
                    const Icon = iconMap[e.action] || User;
                    return (
                        <div
                            key={e.id}
                            className="flex items-start gap-3 rounded-lg border border-zinc-950/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900"
                        >
                            <div className={`mt-0.5 rounded-md p-1 bg-${(actionColors[e.action] || 'zinc')}-100 dark:bg-${(actionColors[e.action] || 'zinc')}-900/30`}>
                                <Icon className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm">
                                    <span className="font-medium text-zinc-950 dark:text-white">{e.user_name}</span>{' '}
                                    <span className="text-zinc-600 dark:text-zinc-400">{e.description}</span>
                                </p>
                                <Text className="mt-0.5 text-xs">
                                    {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
