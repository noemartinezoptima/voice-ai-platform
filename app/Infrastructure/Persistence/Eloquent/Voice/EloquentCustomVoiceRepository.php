<?php

namespace App\Infrastructure\Persistence\Eloquent\Voice;

use App\Domain\Voice\Entities\CustomVoice;
use App\Domain\Voice\Repositories\CustomVoiceRepositoryInterface;

class EloquentCustomVoiceRepository implements CustomVoiceRepositoryInterface
{
    public function __construct(
        private readonly CustomVoiceModel $model,
    ) {}

    public function findById(string $id): ?CustomVoice
    {
        $model = $this->model->find($id);

        return $model ? $this->toEntity($model) : null;
    }

    /** @return CustomVoice[] */
    public function findByTenant(string $tenantId): array
    {
        return $this->model->where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (CustomVoiceModel $model) => $this->toEntity($model))
            ->all();
    }

    public function save(CustomVoice $voice): void
    {
        $this->model->updateOrCreate(
            ['id' => $voice->id()],
            [
                'tenant_id' => $voice->tenantId(),
                'elevenlabs_voice_id' => $voice->elevenlabsVoiceId(),
                'name' => $voice->name(),
                'preview_url' => $voice->previewUrl(),
                'sample_count' => $voice->sampleCount(),
                'description' => $voice->description(),
                'labels' => $voice->labels(),
                'is_default' => $voice->isDefault(),
                'requires_verification' => $voice->requiresVerification(),
            ],
        );
    }

    public function delete(string $id): void
    {
        $this->model->where('id', $id)->delete();
    }

    private function toEntity(CustomVoiceModel $model): CustomVoice
    {
        return new CustomVoice(
            id: $model->id,
            tenantId: $model->tenant_id,
            elevenlabsVoiceId: $model->elevenlabs_voice_id,
            name: $model->name,
            previewUrl: $model->preview_url,
            sampleCount: $model->sample_count,
            description: $model->description,
            labels: $model->labels,
            isDefault: $model->is_default,
            requiresVerification: $model->requires_verification,
            createdAt: \DateTimeImmutable::createFromInterface($model->created_at),
            updatedAt: \DateTimeImmutable::createFromInterface($model->updated_at),
        );
    }
}
