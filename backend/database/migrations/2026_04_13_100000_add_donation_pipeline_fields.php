<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add is_anonymous flag to donations
        Schema::table('donations', function (Blueprint $table) {
            $table->boolean('is_anonymous')->default(false)->after('receipt_url');
        });

        // Add total_donated_cents and level/xp tracking to users
        Schema::table('users', function (Blueprint $table) {
            $table->bigInteger('total_donated_cents')->default(0)->after('points_balance');
            $table->integer('donation_count')->default(0)->after('total_donated_cents');
            $table->integer('level')->default(1)->after('donation_count');
            $table->integer('xp')->default(0)->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn('is_anonymous');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['total_donated_cents', 'donation_count', 'level', 'xp']);
        });
    }
};
