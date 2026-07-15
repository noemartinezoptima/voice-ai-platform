import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/Components/catalyst/table';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { index as qualityIndex, show as qualityShow } from '@/routes/quality';
import { ShieldCheck, Search, X } from 'lucide-react';

function ScoreGauge({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const offset = circ - pct * circ;

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="70" height="70" className="-rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#e4e4e7" strokeWidth="6" />
        <circle
          cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'emerald' : score >= 50 ? 'amber' : 'red';
  return <Badge color={color}>{score}</Badge>;
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <Text className="!text-zinc-500">{label}</Text>
      <p className="text-[28px] font-bold tracking-tight text-zinc-950 dark:text-white">{value}</p>
      {sub && <Text className="mt-1 text-sm !text-zinc-400">{sub}</Text>}
    </div>
  );
}

function DistributionBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">{count}</span>
    </div>
  );
}

export default function Index({
  avgScore,
  totalScored,
  topFlow,
  topFlowScore,
  callsWithScores,
  topFlows,
  recentScored,
  scoreDistribution,
  filters = {},
}) {
  const [localFilters, setLocalFilters] = useState({
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    score_min: filters.score_min ?? '',
    score_max: filters.score_max ?? '',
    search: filters.search ?? '',
  });

  function applyFilters() {
    const params = {}
    Object.entries(localFilters).forEach(([k, v]) => { if (v) params[k] = v })
    router.get(qualityIndex().url, params, { preserveState: true, replace: true })
  }

  function clearFilters() {
    setLocalFilters({ date_from: '', date_to: '', score_min: '', score_max: '', search: '' })
    router.get(qualityIndex().url, {}, { preserveState: true, replace: true })
  }

  function handleFilterKeyDown(e) {
    if (e.key === 'Enter') applyFilters()
  }

  const hasActiveFilters = filters.date_from || filters.date_to || filters.score_min || filters.score_max || filters.search
  const isEmpty = totalScored === 0;
  const distTotal = (scoreDistribution?.excellent ?? 0)
    + (scoreDistribution?.good ?? 0)
    + (scoreDistribution?.fair ?? 0)
    + (scoreDistribution?.poor ?? 0);

  return (
    <AuthenticatedLayout>
      <Head title="Quality Scoring" />

      <div>
        <Heading>Quality Scoring</Heading>
        <Text className="mt-1">Call quality metrics based on sentiment, resolution, and duration.</Text>
      </div>

      {isEmpty ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-zinc-950/5 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-900">
          <ShieldCheck className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <Text className="text-lg text-zinc-500">No quality scores yet</Text>
          <Text className="mt-1 text-sm text-zinc-400 max-w-sm text-center">
            Quality scores are generated automatically after each call completes. They measure sentiment, resolution rate, and call duration to help you track conversation effectiveness.
          </Text>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Average Score"
              value={<span className="flex items-center gap-3">{avgScore} <ScoreGauge score={avgScore} /></span>}
            />
            <StatCard label="Total Scored" value={totalScored} sub="completed calls scored" />
            <StatCard
              label="Top Flow"
              value={topFlow}
              sub={topFlow !== 'N/A' ? `Avg score: ${topFlowScore}` : undefined}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Subheading>Score Distribution</Subheading>
              <div className="mt-4 space-y-3">
                <DistributionBar label="Excellent" count={scoreDistribution?.excellent ?? 0} total={distTotal} color="#22c55e" />
                <DistributionBar label="Good" count={scoreDistribution?.good ?? 0} total={distTotal} color="#3b82f6" />
                <DistributionBar label="Fair" count={scoreDistribution?.fair ?? 0} total={distTotal} color="#f59e0b" />
                <DistributionBar label="Poor" count={scoreDistribution?.poor ?? 0} total={distTotal} color="#ef4444" />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Subheading>Top Flows by Average Score</Subheading>
              {topFlows.length === 0 ? (
                <Text className="mt-4 text-zinc-400">No data yet</Text>
              ) : (
                <div className="mt-4 space-y-3">
                  {topFlows.map((f, i) => (
                    <div key={f.flow_name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-400">#{i + 1}</span>
                        <Text>{f.flow_name}</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <Text className="text-sm !text-zinc-400">{f.call_count} calls</Text>
                        <ScoreBadge score={Math.round(f.avg_score)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Subheading>Recent Scored Calls</Subheading>
              <div className="mt-4">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>From</TableHeader>
                      <TableHeader>To</TableHeader>
                      <TableHeader>Flow</TableHeader>
                      <TableHeader>Score</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader className="text-right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentScored.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.from_number}</TableCell>
                        <TableCell>{item.to_number}</TableCell>
                        <TableCell>{item.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                        <TableCell><ScoreBadge score={item.total_score} /></TableCell>
                        <TableCell>
                          {item.started_at
                            ? new Date(item.started_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })
                            : '\u2014'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={qualityShow({ call: item.call_id }).url}
                            className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Subheading>All Scored Calls</Subheading>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <Text className="mb-1 text-xs !text-zinc-500">From</Text>
                  <Input
                    type="date"
                    value={localFilters.date_from}
                    onChange={(e) => setLocalFilters((p) => ({ ...p, date_from: e.target.value }))}
                    onKeyDown={handleFilterKeyDown}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Text className="mb-1 text-xs !text-zinc-500">To</Text>
                  <Input
                    type="date"
                    value={localFilters.date_to}
                    onChange={(e) => setLocalFilters((p) => ({ ...p, date_to: e.target.value }))}
                    onKeyDown={handleFilterKeyDown}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Text className="mb-1 text-xs !text-zinc-500">Min Score</Text>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={localFilters.score_min}
                    onChange={(e) => setLocalFilters((p) => ({ ...p, score_min: e.target.value }))}
                    onKeyDown={handleFilterKeyDown}
                    placeholder="0"
                    className="h-9 w-20 text-sm"
                  />
                </div>
                <div>
                  <Text className="mb-1 text-xs !text-zinc-500">Max Score</Text>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={localFilters.score_max}
                    onChange={(e) => setLocalFilters((p) => ({ ...p, score_max: e.target.value }))}
                    onKeyDown={handleFilterKeyDown}
                    placeholder="100"
                    className="h-9 w-20 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Text className="mb-1 text-xs !text-zinc-500">Phone Number</Text>
                  <Input
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters((p) => ({ ...p, search: e.target.value }))}
                    onKeyDown={handleFilterKeyDown}
                    placeholder="Search by number..."
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={applyFilters}>
                    <Search className="size-4" />
                    Apply
                  </Button>
                  {hasActiveFilters && (
                    <Button outline onClick={clearFilters}>
                      <X className="size-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>From</TableHeader>
                      <TableHeader>To</TableHeader>
                      <TableHeader>Flow</TableHeader>
                      <TableHeader>Score</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader className="text-right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {callsWithScores.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.from_number}</TableCell>
                        <TableCell>{item.to_number}</TableCell>
                        <TableCell>{item.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                        <TableCell><ScoreBadge score={item.total_score} /></TableCell>
                        <TableCell>
                          <Badge color={item.call_status === 'completed' ? 'emerald' : 'zinc'}>
                            {item.call_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.started_at
                            ? new Date(item.started_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })
                            : '\u2014'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={qualityShow({ call: item.call_id }).url}
                            className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {callsWithScores.links && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationPrevious href={callsWithScores.prev_page_url} />
                      <PaginationList>
                        {callsWithScores.links.map((link, i) => {
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
                      <PaginationNext href={callsWithScores.next_page_url} />
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
