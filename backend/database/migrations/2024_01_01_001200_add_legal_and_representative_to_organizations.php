<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('authorized_rep_name')->nullable()->after('verified_at');
            $table->string('authorized_rep_id')->nullable()->after('authorized_rep_name');
            $table->string('legal_document')->nullable()->after('authorized_rep_id');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'authorized_rep_name',
                'authorized_rep_id',
                'legal_document',
            ]);
        });
    }
};
