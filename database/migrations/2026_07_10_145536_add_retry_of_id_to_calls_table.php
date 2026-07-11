<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->foreignUuid('retry_of_id')
                ->nullable()
                ->after('notes')
                ->constrained('calls')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->dropForeign(['retry_of_id']);
            $table->dropColumn('retry_of_id');
        });
    }
};
