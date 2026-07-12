<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->index(['tenant_id', 'from_number']);
            $table->index(['tenant_id', 'to_number']);
            $table->index(['tenant_id', 'started_at']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('knowledge_chunks', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('custom_voices', function (Blueprint $table) {
            $table->unique(['tenant_id', 'elevenlabs_voice_id']);
        });
    }

    public function down(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'from_number']);
            $table->dropIndex(['tenant_id', 'to_number']);
            $table->dropIndex(['tenant_id', 'started_at']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        Schema::table('knowledge_chunks', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        Schema::table('custom_voices', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'elevenlabs_voice_id']);
        });
    }
};
