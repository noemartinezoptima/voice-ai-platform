import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { index as qualityIndex } from '@/routes/quality';
import { ArrowLeft } from 'lucide-react';

function ScoreCircle({ score, size = 120 }) {
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const offset = circ - pct * circ;
  const cx = size / 2;
  const cy = size / 2;

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4e4e7" strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-zinc-400">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Text className="!text-zinc-600 dark:!text-zinc-400">{label}</Text>
        <span className="text-sm font-semibold" style={{ color }}>{score ?? '-'}</span>
      </div>
      <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score ?? 0}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Show({ call, score, transcriptPreview }) {
  const statusColors = {
    completed: 'emerald',
    failed: 'red',
    in_progress: 'amber',
    initiated: 'blue',
    transferred: 'purple',
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Quality Score - ${call.from_number}`} />

      <div className="flex items-center gap-4 mb-6">
        <Link href={qualityIndex().url}>
          <Button outline>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <Heading>Call Quality Score</Heading>
          <Text className="mt-1">
            {call.from_number} &rarr; {call.to_number}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
            <Subheading>Call Summary</Subheading>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <Text className="!text-zinc-500">Flow</Text>
                <Text>{call.flow_name || 'N/A'}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="!text-zinc-500">From</Text>
                <Text>{call.from_number}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="!text-zinc-500">To</Text>
                <Text>{call.to_number}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="!text-zinc-500">Status</Text>
                <Badge color={statusColors[call.status] ?? 'zinc'}>
                  {call.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <Text className="!text-zinc-500">Duration</Text>
                <Text>
                  {call.duration_seconds
                    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                    : 'N/A'}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="!text-zinc-500">Date</Text>
                <Text>
                  {call.started_at
                    ? new Date(call.started_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })
                    : 'N/A'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!score ? (
            <div className="rounded-xl border border-zinc-950/5 bg-white p-12 dark:border-white/10 dark:bg-zinc-900 text-center">
              <Text className="text-lg text-zinc-500">No quality score available</Text>
              <Text className="mt-1 text-sm text-zinc-400">
                This call hasn't been scored yet. Scores are generated automatically for completed calls.
              </Text>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex flex-col items-center">
                  <Subheading>Overall Score</Subheading>
                  <div className="mt-4">
                    <ScoreCircle score={score.total_score} size={160} />
                  </div>
                  <Text className="mt-3 !text-zinc-500">
                    {score.total_score >= 80 ? 'Excellent' : score.total_score >= 60 ? 'Good' : score.total_score >= 40 ? 'Fair' : 'Needs Improvement'}
                  </Text>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                <Subheading>Score Breakdown</Subheading>
                <div className="mt-4 space-y-4">
                  <ScoreBar label="Politeness" score={score.politeness_score} color="#6366f1" />
                  <ScoreBar label="Resolution" score={score.resolution_score} color="#3b82f6" />
                  <ScoreBar label="Duration" score={score.duration_score} color="#22c55e" />
                  {(score.politeness_score == null || score.politeness_score === 0) && (
                    <Text className="!text-zinc-400 text-xs italic">
                      Politeness score may be 0 when no transcripts are available for sentiment analysis.
                    </Text>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="rounded-xl border border-zinc-950/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
            <Subheading>Transcript Preview</Subheading>
            {transcriptPreview.length === 0 ? (
              <Text className="mt-4 !text-zinc-400">No transcript available.</Text>
            ) : (
              <div className="mt-4 space-y-3">
                {transcriptPreview.map((t, i) => (
                  <div key={`${t.role}-${t.text?.slice(0, 30) || ''}-${i}`} className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                    <Badge color={t.role === 'user' ? 'blue' : 'emerald'} className="mb-1">
                      {t.role}
                    </Badge>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{t.text}</p>
                  </div>
                ))}
                {transcriptPreview.length === 5 && (
                  <Text className="!text-zinc-400 !text-xs italic">
                    Showing first 5 transcript entries.
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
