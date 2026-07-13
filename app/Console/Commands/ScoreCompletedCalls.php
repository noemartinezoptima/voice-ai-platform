<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Call\CallQualityScoreModel;
use App\Services\CallQualityScoringService;
use Illuminate\Console\Command;

class ScoreCompletedCalls extends Command
{
    protected $signature = 'calls:score-completed';

    protected $description = 'Score completed calls that haven\'t been scored yet';

    public function handle(CallQualityScoringService $scorer): int
    {
        $calls = CallModel::query()
            ->whereNotIn('id', CallQualityScoreModel::query()->select('call_id'))
            ->where('status', 'completed')
            ->get();

        if ($calls->isEmpty()) {
            $this->info('No unscored completed calls found.');

            return self::SUCCESS;
        }

        $count = 0;
        foreach ($calls as $call) {
            $scores = $scorer->scoreCall($call);

            CallQualityScoreModel::create([
                'call_id' => $call->id,
                'tenant_id' => $call->tenant_id,
                'total_score' => $scores['total_score'],
                'politeness_score' => $scores['politeness_score'],
                'resolution_score' => $scores['resolution_score'],
                'duration_score' => $scores['duration_score'],
                'details' => $scores,
            ]);

            $count++;
        }

        $this->info("Scored {$count} completed call(s).");

        return self::SUCCESS;
    }
}
