<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Knowledge\ChunkModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChunkModelFactory extends Factory
{
    protected $model = ChunkModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'document_id' => DocumentModelFactory::new(),
            'content' => fake()->paragraph(),
            'embedding' => null,
            'chunk_index' => 0,
            'metadata' => [],
        ];
    }
}
