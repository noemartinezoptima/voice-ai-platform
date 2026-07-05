<?php

namespace App\Infrastructure\Persistence\Eloquent\Knowledge;

use App\Domain\Knowledge\Entities\Document;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\ValueObjects\DocumentStatus;
use App\Domain\Knowledge\ValueObjects\ResourceType;

class EloquentDocumentRepository implements DocumentRepositoryInterface
{
    public function findById(string $id): ?Document
    {
        $model = DocumentModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    /** @return Document[] */
    public function findByTenant(string $tenantId): array
    {
        return DocumentModel::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (DocumentModel $model) => $this->toEntity($model))
            ->all();
    }

    public function save(Document $document): void
    {
        DocumentModel::updateOrCreate(
            ['id' => $document->id()],
            [
                'tenant_id' => $document->tenantId(),
                'name' => $document->name(),
                'resource_type' => $document->resourceType()->value,
                'mime_type' => $document->mimeType(),
                'path' => $document->path(),
                'status' => $document->status()->value,
                'error' => $document->error(),
                'metadata' => $document->metadata(),
            ],
        );
    }

    public function delete(string $id): void
    {
        DocumentModel::where('id', $id)->delete();
    }

    private function toEntity(DocumentModel $model): Document
    {
        return new Document(
            id: $model->id,
            tenantId: $model->tenant_id,
            name: $model->name,
            resourceType: ResourceType::from($model->resource_type),
            mimeType: $model->mime_type,
            path: $model->path,
            status: DocumentStatus::from($model->status),
            error: $model->error,
            metadata: $model->metadata ?? [],
        );
    }
}
