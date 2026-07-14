import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActivityFeed from '@/Components/ActivityFeed';
import { Head, router, usePage } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/Components/catalyst/table';
import {
  Activity, BarChart3, Clock, Download, GitBranch, Phone, PhoneCall,
  PhoneIncoming, PieChart as PieChartIcon, TrendingUp,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';
import { formatDuration } from '@/utils/format';

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const icons = { Activity, GitBranch, Phone, PhoneIncoming, PhoneCall, Clock };

const statCards = [
  { label: 'Total Flows', key: 'total_flows', icon: 'GitBranch' },
  { label: 'Active Flows', key: 'active_flows', icon: 'Activity' },
  { label: 'Total Calls', key: 'total_calls', icon: 'Phone' },
  { label: 'Calls Today', key: 'calls_today', icon: 'PhoneIncoming' },
  { label: 'Active Calls', key: 'active_calls', icon: 'PhoneCall' },
  { label: 'Avg Duration', key: 'avg_duration_seconds', icon: 'Clock', format: formatDuration },
];

const STATUS_COLORS = {
  completed: '#22c55e',
  in_progress: '#f59e0b',
  initiated: '#3b82f6',
  failed: '#ef4444',
  transferred: '#a855f7',
};

function dateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(/-/g, '/'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function chartCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-zinc-500" />}
        <Subheading>{title}</Subheading>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({
  stats, range, callsByDay, callsByStatus, avgDurationByDay,
  callsByFlow, callsByFlowWithMetrics,
}) {
  const { url } = usePage();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : url.split('?')[1]
  );
  const activeStart = params.get('start');
  const activeEnd = params.get('end');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

    const applyPreset = useCallback((days) => {
        setLoading(true);
        router.get('/dashboard', { start: dateDaysAgo(days), end: todayStr() }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, []);

    const applyCustom = useCallback((e) => {
        e.preventDefault();
        if (!customStart || !customEnd) return;
        setLoading(true);
        router.get('/dashboard', { start: customStart, end: customEnd }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, [customStart, customEnd]);

  function getActivePreset() {
    if (!activeStart) return 7;
    const diff = Math.round(
      (new Date(todayStr()).getTime() - new Date(activeStart.replace(/-/g, '/')).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const match = PRESETS.find((p) => p.days === diff);
    return match ? match.days : null;
  }

  const activePreset = getActivePreset();

  const rangeLabel = `${shortDate(range.start)} – ${shortDate(range.end)}`;

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    backgroundColor: 'white',
  };

  const isEmpty = callsByDay.length === 0;

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="flex items-end justify-between">
        <div>
          <Heading>Dashboard</Heading>
          <Text className="mt-1">{rangeLabel}</Text>
        </div>
        <a href={`/dashboard/export/csv?${params.toString()}`} className="inline-flex">
          <Button outline>
            <Download />
            Export
          </Button>
        </a>
      </div>

      {/* Date Range Filter */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => applyPreset(p.days)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activePreset === p.days
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <form onSubmit={applyCustom} className="flex items-end gap-2">
          <div className="w-36">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={todayStr()}
            />
          </div>
          <Text className="mb-1.5">to</Text>
          <div className="w-36">
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              max={todayStr()}
              min={customStart}
            />
          </div>
          <Button type="submit" color="dark/zinc" disabled={!customStart || !customEnd}>
            Apply
          </Button>
        </form>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? statCards.map((s) => (
              <div
                key={s.key}
                className="animate-pulse rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-7 w-16 rounded bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))
          : statCards.map((s) => {
          const Icon = icons[s.icon];
          return (
            <div
              key={s.key}
              className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Text className="!text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</Text>
                  <p className="text-[28px] font-bold tracking-tight text-zinc-950 dark:text-white">
                    {s.format ? s.format(stats[s.key]) : stats[s.key]}
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                  <Icon className="size-5 text-indigo-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60 transition-opacity' : ''}`}>
        {chartCard({
          icon: TrendingUp,
          title: `Calls (${rangeLabel})`,
          children: isEmpty ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" className="text-xs text-zinc-500" />
                <YAxis className="text-xs text-zinc-500" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Calls" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ),
        })}

        {chartCard({
          icon: BarChart3,
          title: `Avg Duration (${rangeLabel})`,
          children: avgDurationByDay.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No duration data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgDurationByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" className="text-xs text-zinc-500" />
                <YAxis className="text-xs text-zinc-500" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatDuration(Math.round(value)), 'Avg Duration']}
                />
                <Legend />
                <Bar dataKey="avg_seconds" name="Avg Duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        })}
      </div>

      {/* Charts Row 2 */}
      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60 transition-opacity' : ''}`}>
        {chartCard({
          icon: PieChartIcon,
          title: 'Call Status',
          children: callsByStatus.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={callsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                >
                  {callsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, props) => {
                    const total = callsByStatus.reduce((s, i) => s + i.count, 0);
                    const pct = total ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} (${pct}%)`, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ),
        })}

        {chartCard({
          icon: BarChart3,
          title: `Calls by Flow (Top 5)`,
          children: callsByFlow.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No flow data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={callsByFlow} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis type="number" className="text-xs text-zinc-500" allowDecimals={false} />
                <YAxis dataKey="flow_name" type="category" className="text-xs text-zinc-500" width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="count" name="Calls" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        })}
      </div>

      {/* Flow Performance */}
      <div className={`mt-6 ${loading ? 'pointer-events-none opacity-60 transition-opacity' : ''}`}>
        <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <Subheading>Flow Performance</Subheading>
          </div>

          {callsByFlowWithMetrics.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No flow data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={callsByFlowWithMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                  <XAxis dataKey="flow_name" className="text-xs text-zinc-500" />
                  <YAxis className="text-xs text-zinc-500" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatDuration(Math.round(value)), 'Avg Duration']}
                  />
                  <Legend />
                  <Bar dataKey="avg_duration" name="Avg Duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <Table dense>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Flow Name</TableHeader>
                      <TableHeader>Calls</TableHeader>
                      <TableHeader>Avg Duration</TableHeader>
                      <TableHeader>Success Rate</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {callsByFlowWithMetrics.map((f) => (
                      <TableRow key={f.flow_name}>
                        <TableCell className="font-medium">{f.flow_name}</TableCell>
                        <TableCell>{f.total_calls}</TableCell>
                        <TableCell>{formatDuration(f.avg_duration)}</TableCell>
                        <TableCell>{f.success_rate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
      <ActivityFeed />
    </AuthenticatedLayout>
  );
}
