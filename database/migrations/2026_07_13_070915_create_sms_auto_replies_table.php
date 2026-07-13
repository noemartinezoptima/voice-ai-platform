<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_auto_replies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('keyword');
            $table->text('reply_text');
            $table->boolean('is_active')->default(true);
            $table->string('match_type')->default('contains');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_auto_replies');
    }
};
