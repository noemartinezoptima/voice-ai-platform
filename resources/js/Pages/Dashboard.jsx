import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import {
  Activity, GitBranch, Phone, PhoneIncoming, PhoneCall, Clock, TrendingUp, PieChart as PieChartIcon, BarChart3,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const icons = { Activity, GitBranch, Phone, PhoneIncoming, PhoneCall, Clock };

const statCards = [
  { label: 'Total Flows', key: 'total_flows', icon: 'GitBranch' },
  { label: 'Active Flows', key: 'active_flows', icon: 'Activity' },
  { label: 'Total Calls', key: 'total_calls', icon: 'Phone' },
  { label: 'Calls Today', key: 'calls_today', icon: 'PhoneIncoming' },
  { label: 'Active Calls', key: 'active_calls', icon: 'PhoneCall' },
  { label: 'Avg Duration', key: 'avg_duration_seconds', icon: 'Clock', format: (v) => `${v}s` },
];

const STATUS_COLORS = {
  completed: '#22c55e',
  in_progress: '#f59e0b',
  initiated: '#3b82f6',
  failed: '#ef4444',
  transferred: '#a855f7',
};

export default function Dashboard({ stats, callsByDay, callsByStatus, avgDurationByDay, callsByFlow }) {
  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <Heading>Dashboard</Heading>
      <Text className="mt-1">Overview of your voice AI platform activity.</Text>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => {
          const Icon = icons[s.icon];
          return (
            <div
              key={s.key}
              className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Text className="!text-zinc-500">{s.label}</Text>
                  <p className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                    {s.format ? s.format(stats[s.key]) : stats[s.key]}
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
                  <Icon className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calls by Day */}
        <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-zinc-500" />
            <Subheading>Calls (Last 7 Days)</Subheading>
          </div>
          {callsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" className="text-xs text-zinc-500" />
                <YAxis className="text-xs text-zinc-500" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: 'white',
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          )}
        </div>

        {/* Avg Duration by Day */}
        <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <Subheading>Avg Duration (Last 7 Days)</Subheading>
          </div>
          {avgDurationByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgDurationByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" className="text-xs text-zinc-500" />
                <YAxis className="text-xs text-zinc-500" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: 'white',
                  }}
                  formatter={(value) => [`${Math.round(value)}s`, 'Avg Duration']}
                />
                <Bar dataKey="avg_seconds" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No duration data yet</div>
          )}
        </div>
      </div>

      {/* Second charts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="size-4 text-zinc-500" />
            <Subheading>Call Status</Subheading>
          </div>
          {callsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={callsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                >
                  {callsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          )}
        </div>

        {/* Calls by Flow */}
        <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <Subheading>Calls by Flow (Top 5)</Subheading>
          </div>
          {callsByFlow.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={callsByFlow} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis type="number" className="text-xs text-zinc-500" allowDecimals={false} />
                <YAxis dataKey="flow_name" type="category" className="text-xs text-zinc-500" width={120} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: 'white',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No flow data yet</div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
