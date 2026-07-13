<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_quality_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('call_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->integer('total_score')->default(0);
            $table->integer('politeness_score')->nullable();
            $table->integer('resolution_score')->nullable();
            $table->integer('duration_score')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();

            $table->unique('call_id');
            $table->index(['tenant_id', 'total_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_quality_scores');
    }
};
