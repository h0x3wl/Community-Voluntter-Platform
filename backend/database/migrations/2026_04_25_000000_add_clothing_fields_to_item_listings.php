<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_listings', function (Blueprint $table) {
            $table->string('ai_category')->nullable()->after('condition');
            $table->decimal('ai_confidence', 5, 2)->nullable()->after('ai_category');
            $table->foreignId('target_organization_id')->nullable()->after('donor_user_id')
                ->constrained('organizations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('item_listings', function (Blueprint $table) {
            $table->dropForeign(['target_organization_id']);
            $table->dropColumn(['ai_category', 'ai_confidence', 'target_organization_id']);
        });
    }
};
