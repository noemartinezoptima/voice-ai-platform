<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('webhook_destination_id')->constrained()->cascadeOnDelete();
            $table->string('event');
            $table->json('payload');
            $table->string('status')->default('pending');
            $table->integer('response_code')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('attempt')->default(1);
            $table->timestamp('next_attempt_at')->nullable();
            $table->timestamps();

            $table->index(['webhook_destination_id', 'status']);
            $table->index('next_attempt_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
    }
};
