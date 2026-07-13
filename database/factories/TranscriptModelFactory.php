<?php

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Call\TranscriptModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class TranscriptModelFactory extends Factory
{
    protected $model = TranscriptModel::class;

    public function definition(): array
    {
        return [
            'call_id' => CallModelFactory::new()->create()->id,
            'role' => $this->faker->randomElement(['user', 'assistant']),
            'text' => $this->faker->sentence(),
            'confidence' => $this->faker->randomFloat(2, 0.5, 1.0),
            'start_offset_ms' => $this->faker->numberBetween(0, 10000),
            'end_offset_ms' => $this->faker->numberBetween(10001, 20000),
        ];
    }

    public function withCallId(string $callId): static
    {
        return $this->state(fn () => ['call_id' => $callId]);
    }

    public function withRole(string $role): static
    {
        return $this->state(fn () => ['role' => $role]);
    }

    public function withText(string $text): static
    {
        return $this->state(fn () => ['text' => $text]);
    }
}
