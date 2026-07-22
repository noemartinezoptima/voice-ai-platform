import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/Components/catalyst/table';
import { Download } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const TOPIC_COLORS = [
  '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
];

function SentimentEmoji({ score }) {
  if (score > 0.05) return '😊';
  if (score < -0.05) return '😞';
  return '😐';
}

function StatCard({ label, value, icon, format }) {
  return (
    <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Text className="!text-zinc-500">{label}</Text>
          <p className="text-[28px] font-bold tracking-tight text-zinc-950 dark:text-white">
            {format ? format(value) : value}
          </p>
        </div>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        <Subheading>{title}</Subheading>
      </div>
      {children}
    </div>
  );
}

export default function Index({
  sentimentDistribution,
  sentimentOverTime,
  topKeywords,
  topicBreakdown,
  callerSentiment,
  totalTranscripts,
  avgSentiment,
  topTopic,
}) {
  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    backgroundColor: 'white',
  };

  const isEmpty = totalTranscripts === 0;

  const distData = [
    { name: 'Positive', value: sentimentDistribution.positive },
    { name: 'Neutral', value: sentimentDistribution.neutral },
    { name: 'Negative', value: sentimentDistribution.negative },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Conversation Analytics" />

      <div className="flex items-end justify-between">
        <div>
          <Heading>Conversation Analytics</Heading>
          <Text className="mt-1">Last 90 days</Text>
        </div>
        <a href="/analytics/export/csv" className="inline-flex">
          <Button outline>
            <Download />
            Export
          </Button>
        </a>
      </div>

      {isEmpty ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-zinc-950/5 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-lg text-zinc-500">No transcripts analyzed yet</Text>
          <Text className="mt-1 text-sm text-zinc-400">
            Call transcripts will appear here once conversations are recorded.
          </Text>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Transcripts"
              value={totalTranscripts}
              icon={<span className="text-lg">{SentimentEmoji({ score: avgSentiment })}</span>}
            />
            <StatCard
              label="Avg Sentiment"
              icon={<span className="text-lg">{SentimentEmoji({ score: avgSentiment })}</span>}
              format={(v) => (
                <span className="flex items-center gap-2">
                  {v.toFixed(2)} <span className="text-xl">{SentimentEmoji({ score: v })}</span>
                </span>
              )}
              value={avgSentiment}
            />
            <StatCard
              label="Top Topic"
              value={topTopic.charAt(0).toUpperCase() + topTopic.slice(1)}
              icon={<span className="text-lg">#</span>}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Sentiment Distribution">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {distData.map((entry) => (
                      <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Sentiment Over Time">
              {sentimentOverTime.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={sentimentOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                    <XAxis dataKey="date" className="text-xs text-zinc-500" />
                    <YAxis className="text-xs text-zinc-500" domain={[-1, 1]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avg_score"
                      name="Avg Sentiment"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Top Keywords">
              {topKeywords.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-zinc-400">No keywords yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topKeywords} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                    <XAxis type="number" className="text-xs text-zinc-500" allowDecimals={false} />
                    <YAxis dataKey="word" type="category" className="text-xs text-zinc-500" width={100} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Occurrences" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Topic Breakdown">
              {topicBreakdown.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-zinc-400">No topics yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topicBreakdown}
                      dataKey="count"
                      nameKey="topic"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      label={({ topic, percent }) =>
                        `${topic.charAt(0).toUpperCase() + topic.slice(1)} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {topicBreakdown.map((entry, idx) => (
                        <Cell key={entry.topic} fill={TOPIC_COLORS[idx % TOPIC_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard title="Caller Sentiment (Top 10)">
              {callerSentiment.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-zinc-400">No callers yet</div>
              ) : (
                <Table dense>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Caller</TableHeader>
                      <TableHeader>Avg Sentiment</TableHeader>
                      <TableHeader>Calls</TableHeader>
                      <TableHeader>Sentiment</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {callerSentiment.map((c) => (
                      <TableRow key={c.caller}>
                        <TableCell className="font-medium">{c.caller}</TableCell>
                        <TableCell>{c.avg_score.toFixed(3)}</TableCell>
                        <TableCell>{c.calls}</TableCell>
                        <TableCell>
                          {SentimentEmoji({ score: c.avg_score })}{' '}
                          {c.avg_score > 0.05 ? 'Positive' : c.avg_score < -0.05 ? 'Negative' : 'Neutral'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
