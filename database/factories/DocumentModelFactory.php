<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentModelFactory extends Factory
{
    protected $model = DocumentModel::class;

    public function definition(): array
    {
        return [
            'tenant_id' => TenantFactory::new(),
            'name' => fake()->sentence(),
            'resource_type' => 'pdf',
            'mime_type' => 'application/pdf',
            'path' => fake()->filePath(),
            'status' => 'ready',
            'metadata' => [],
        ];
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }
}
