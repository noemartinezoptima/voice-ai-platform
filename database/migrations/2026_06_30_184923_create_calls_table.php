<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained();
            $table->foreignUuid('flow_id')->nullable()->constrained();
            $table->string('call_sid')->unique();
            $table->string('from_number');
            $table->string('to_number');
            $table->string('status')->default('initiated');
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('current_step')->nullable();
            $table->json('context')->default('{}');
            $table->text('error')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calls');
    }
};
