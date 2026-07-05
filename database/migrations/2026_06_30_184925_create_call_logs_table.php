<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('call_id')->constrained()->cascadeOnDelete();
            $table->string('step_type');
            $table->string('step_id')->nullable();
            $table->text('input')->nullable();
            $table->text('output')->nullable();
            $table->json('metadata')->default('{}');
            $table->unsignedInteger('duration_ms')->default(0);
            $table->timestamps();

            $table->index('call_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_logs');
    }
};
