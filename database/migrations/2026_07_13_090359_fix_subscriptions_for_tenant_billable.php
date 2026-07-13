<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('subscriptions')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                if (Schema::hasColumn('subscriptions', 'user_id')) {
                    $table->dropIndex(['user_id', 'stripe_status']);
                    $table->dropColumn('user_id');
                }

                if (! Schema::hasColumn('subscriptions', 'tenant_model_id')) {
                    $table->foreignUuid('tenant_model_id')->index();
                    $table->index(['tenant_model_id', 'stripe_status']);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('subscriptions')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                if (Schema::hasColumn('subscriptions', 'tenant_model_id')) {
                    $table->dropIndex(['tenant_model_id', 'stripe_status']);
                    $table->dropColumn('tenant_model_id');
                }

                if (! Schema::hasColumn('subscriptions', 'user_id')) {
                    $table->foreignId('user_id');
                    $table->index(['user_id', 'stripe_status']);
                }
            });
        }
    }
};
