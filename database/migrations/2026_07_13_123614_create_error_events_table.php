<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('error_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('hash', 64)->unique();
            $table->string('class');
            $table->string('file');
            $table->integer('line');
            $table->text('message');
            $table->integer('occurrence_count')->default(1);
            $table->timestamp('last_seen_at');
            $table->timestamp('first_seen_at');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('error_events');
    }
};
