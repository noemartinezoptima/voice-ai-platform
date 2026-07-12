<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sms_messages', function (Blueprint $table) {
            $table->string('channel')->default('sms')->after('body');
        });
    }

    public function down(): void
    {
        Schema::table('sms_messages', function (Blueprint $table) {
            $table->dropColumn('channel');
        });
    }
};
