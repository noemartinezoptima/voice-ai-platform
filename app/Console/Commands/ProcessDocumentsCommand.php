<?php

namespace App\Console\Commands;

use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use App\Jobs\ProcessDocumentJob;
use Illuminate\Console\Command;

class ProcessDocumentsCommand extends Command
{
    protected $signature = 'documents:process {--limit=10 : Max documents to process}';

    protected $description = 'Process all pending documents';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');
        $pending = DocumentModel::where('status', 'pending')
            ->limit($limit)
            ->get();

        if ($pending->isEmpty()) {
            $this->info('No pending documents found.');

            return self::SUCCESS;
        }

        $this->info("Dispatching {$pending->count()} documents...");

        foreach ($pending as $doc) {
            ProcessDocumentJob::dispatch($doc->id);
            $this->line("  Queued: {$doc->name}");
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
