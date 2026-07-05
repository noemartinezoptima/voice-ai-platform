<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('call_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->text('text');
            $table->unsignedInteger('start_offset_ms')->nullable();
            $table->unsignedInteger('end_offset_ms')->nullable();
            $table->float('confidence')->nullable();
            $table->json('metadata')->default('{}');
            $table->timestamps();

            $table->index('call_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcripts');
    }
};
