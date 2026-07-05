<?php

namespace App\Domain\Knowledge\Services;

use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use Illuminate\Support\Facades\DB;

class KnowledgeRetrievalService
{
    public function __construct(
        private readonly EmbeddingServiceInterface $embeddings,
        private readonly ChunkingService $chunking,
    ) {}

    public function retrieve(
        string $tenantId,
        string $query,
        int $topK = 5,
        ?string $resourceType = null,
        RetrievalType $type = RetrievalType::Semantic,
    ): RetrievalResult {
        $queryEmbedding = $this->embeddings->embed($query);

        $rawChunks = $this->searchSimilar($tenantId, $queryEmbedding, $topK, $resourceType);

        $chunkResults = [];
        foreach ($rawChunks as $row) {
            $chunkResults[] = new ChunkResult(
                content: $row['content'],
                similarity: $row['similarity'],
                documentName: $row['document_name'],
                metadata: $row['metadata'],
            );
        }

        if ($type === RetrievalType::Summary && count($chunkResults) > 1) {
            $combined = implode("\n\n", array_map(fn (ChunkResult $c) => $c->content, $chunkResults));
            $summarizedChunks = $this->chunking->chunk($combined);
            $contextText = implode("\n\n", array_slice($summarizedChunks, 0, 3));
        } else {
            $contextText = implode(
                "\n\n---\n\n",
                array_map(
                    fn (ChunkResult $c, int $i) => "[Source {$i}: {$c->documentName}]\n{$c->content}",
                    $chunkResults,
                    array_keys($chunkResults),
                ),
            );
        }

        return new RetrievalResult(
            chunks: $chunkResults,
            contextText: $contextText,
            type: $type,
        );
    }

    /**
     * @param float[] $queryEmbedding
     * @return list<array{content: string, similarity: float, document_name: string, metadata: array<string, mixed>}>
     */
    private function searchSimilar(
        string $tenantId,
        array $queryEmbedding,
        int $topK,
        ?string $resourceType,
    ): array {
        $query = DB::table('knowledge_chunks as kc')
            ->join('documents as d', 'd.id', '=', 'kc.document_id')
            ->select('kc.content', 'kc.metadata', 'kc.embedding', 'd.name as document_name')
            ->where('kc.tenant_id', $tenantId);

        if ($resourceType !== null) {
            $query->where('d.resource_type', $resourceType);
        }

        $rows = $query->get();

        $scored = [];
        foreach ($rows as $row) {
            $stored = json_decode($row->embedding ?? '[]', true);
            if (! is_array($stored) || count($stored) === 0) {
                continue;
            }
            $similarity = $this->cosineSimilarity($queryEmbedding, $stored);
            $scored[] = [
                'content' => $row->content,
                'similarity' => $similarity,
                'document_name' => $row->document_name,
                'metadata' => json_decode($row->metadata ?? '{}', true),
            ];
        }

        usort($scored, fn (array $a, array $b) => $b['similarity'] <=> $a['similarity']);

        return array_slice($scored, 0, $topK);
    }

    /**
     * @param float[] $a
     * @param float[] $b
     */
    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0;
        $normA = 0;
        $normB = 0;

        foreach ($a as $i => $valA) {
            $valB = $b[$i] ?? 0;
            $dot += $valA * $valB;
            $normA += $valA * $valA;
            $normB += $valB * $valB;
        }

        if ($normA === 0.0 || $normB === 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }
}
