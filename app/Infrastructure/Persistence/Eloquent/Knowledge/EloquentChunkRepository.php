<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use App\Domain\Knowledge\Entities\KnowledgeChunk;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;

class EloquentChunkRepository implements KnowledgeChunkRepositoryInterface
{
    /** @return KnowledgeChunk[] */
    public function findByDocument(string $documentId): array
    {
        return ChunkModel::where('document_id', $documentId)
            ->orderBy('chunk_index')
            ->get()
            ->map(fn (ChunkModel $model) => $this->toEntity($model))
            ->all();
    }

    /** @return KnowledgeChunk[] */
    public function findByTenant(string $tenantId): array
    {
        return ChunkModel::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ChunkModel $model) => $this->toEntity($model))
            ->all();
    }

    public function save(KnowledgeChunk $chunk): void
    {
        ChunkModel::updateOrCreate(
            ['id' => $chunk->id()],
            [
                'document_id' => $chunk->documentId(),
                'tenant_id' => $chunk->tenantId(),
                'chunk_index' => $chunk->chunkIndex(),
                'content' => $chunk->content(),
                'embedding' => $chunk->embedding() !== null ? json_encode($chunk->embedding()) : null,
                'metadata' => $chunk->metadata(),
            ],
        );
    }

    public function saveMany(array $chunks): void
    {
        foreach ($chunks as $chunk) {
            $this->save($chunk);
        }
    }

    public function deleteByDocument(string $documentId): void
    {
        ChunkModel::where('document_id', $documentId)->delete();
    }

    private function toEntity(ChunkModel $model): KnowledgeChunk
    {
        $embedding = null;
        if ($model->embedding !== null) {
            $decoded = json_decode($model->embedding, true);
            $embedding = is_array($decoded) ? $decoded : null;
        }

        return new KnowledgeChunk(
            id: $model->id,
            documentId: $model->document_id,
            tenantId: $model->tenant_id,
            chunkIndex: $model->chunk_index,
            content: $model->content,
            embedding: $embedding,
            metadata: $model->metadata ?? [],
        );
    }
}
