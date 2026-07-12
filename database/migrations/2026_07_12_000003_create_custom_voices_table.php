<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_voices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('elevenlabs_voice_id');
            $table->string('name');
            $table->string('preview_url')->nullable();
            $table->integer('sample_count')->default(0);
            $table->text('description')->nullable();
            $table->json('labels')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('requires_verification')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_voices');
    }
};
