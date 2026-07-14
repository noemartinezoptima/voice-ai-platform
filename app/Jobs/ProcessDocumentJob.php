<?php

namespace App\Jobs;

use App\Domain\Knowledge\Entities\KnowledgeChunk;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use App\Domain\Knowledge\Services\ChunkingService;
use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use App\Infrastructure\Services\Knowledge\CsvDocumentProcessor;
use App\Infrastructure\Services\Knowledge\ImageDocumentProcessor;
use App\Infrastructure\Services\Knowledge\PdfDocumentProcessor;
use App\Infrastructure\Services\Knowledge\TextDocumentProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Str;

class ProcessDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $timeout = 300;

    public function __construct(
        private readonly string $documentId,
    ) {}

    public function handle(
        DocumentRepositoryInterface $documents,
        KnowledgeChunkRepositoryInterface $chunks,
        EmbeddingServiceInterface $embeddings,
        ChunkingService $chunking,
    ): void {
        $document = $documents->findById($this->documentId);

        if ($document === null) {
            return;
        }

        $document->markProcessing();
        $documents->save($document);

        try {
            $processor = $this->resolveProcessor($document->mimeType());

            if ($processor === null) {
                $document->markFailed("Unsupported file type: {$document->mimeType()}");

                $documents->save($document);

                return;
            }

            $text = $processor->extractText(storage_path("app/{$document->path()}"));
            $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');

            $document->updateMetadata([
                'char_count' => strlen($text),
                'chunk_count' => 0,
            ]);

            $textChunks = $chunking->chunk($text);

            if (count($textChunks) === 0) {
                $document->markFailed('No text content extracted.');

                $documents->save($document);

                return;
            }

            $chunkEntities = [];
            $embeddingInputs = [];

            foreach ($textChunks as $index => $chunkText) {
                $embeddingInputs[] = $chunkText;
                $chunkEntities[] = new KnowledgeChunk(
                    id: (string) Str::uuid(),
                    documentId: $document->id(),
                    tenantId: $document->tenantId(),
                    chunkIndex: $index,
                    content: $chunkText,
                );
            }

            $embeddingVectors = $embeddings->embedMany($embeddingInputs);

            foreach ($chunkEntities as $i => $chunk) {
                if (isset($embeddingVectors[$i])) {
                    $chunk->setEmbedding($embeddingVectors[$i]);
                }
            }

            $chunks->deleteByDocument($document->id());
            $chunks->saveMany($chunkEntities);

            $document->updateMetadata([
                'chunk_count' => count($chunkEntities),
            ]);
            $document->markReady();
            $documents->save($document);
        } catch (\Throwable $e) {
            $document->markFailed($e->getMessage());
            $documents->save($document);
        }
    }

    private function resolveProcessor(string $mimeType): ?object
    {
        $apiKey = config('services.openai.api_key', '');

        $processors = [
            new PdfDocumentProcessor,
            new ImageDocumentProcessor($apiKey),
            new TextDocumentProcessor,
            new CsvDocumentProcessor,
        ];

        foreach ($processors as $processor) {
            if ($processor->supports($mimeType)) {
                return $processor;
            }
        }

        return null;
    }
}
