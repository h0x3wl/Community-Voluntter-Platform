<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('tax_id')->nullable()->after('country');
            $table->string('license_number')->nullable()->after('tax_id');
            $table->string('org_type')->nullable()->after('license_number');
            $table->string('verification_status')->default('unverified')->after('org_type');
            $table->timestamp('verified_at')->nullable()->after('verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'tax_id',
                'license_number',
                'org_type',
                'verification_status',
                'verified_at',
            ]);
        });
    }
};
