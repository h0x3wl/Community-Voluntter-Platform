<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('user_notification_preferences', function (Blueprint $table) {
            if (!Schema::hasColumn('user_notification_preferences', 'campaign_updates')) {
                $table->boolean('campaign_updates')->default(true)->after('push_notifications');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_notification_preferences', function (Blueprint $table) {
            if (Schema::hasColumn('user_notification_preferences', 'campaign_updates')) {
                $table->dropColumn('campaign_updates');
            }
        });

        Schema::dropIfExists('notifications');
    }
};
