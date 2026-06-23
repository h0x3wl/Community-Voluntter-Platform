<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed the badges table with default badge data.
 * This ensures badges always exist after migration,
 * regardless of whether seeders are run.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now()->toDateTimeString();

        $badges = [
            // Donation count milestones
            ['code' => 'first_step', 'name' => 'First Step', 'description' => 'Made your very first donation. Welcome to the community!', 'criteria_type' => 'donation_count', 'criteria_value' => 1, 'min_points' => 0, 'display_order' => 1],
            ['code' => 'frequent_donor', 'name' => 'Frequent Donor', 'description' => 'Completed 5 or more donations. Consistency is key!', 'criteria_type' => 'donation_count', 'criteria_value' => 5, 'min_points' => 0, 'display_order' => 2],
            ['code' => 'dedicated_donor', 'name' => 'Dedicated Donor', 'description' => 'Completed 10 or more donations. True dedication!', 'criteria_type' => 'donation_count', 'criteria_value' => 10, 'min_points' => 0, 'display_order' => 3],
            ['code' => 'community_pillar', 'name' => 'Community Pillar', 'description' => 'Completed 20 or more donations. A pillar of our community.', 'criteria_type' => 'donation_count', 'criteria_value' => 20, 'min_points' => 0, 'display_order' => 4],
            ['code' => 'century_club', 'name' => 'Century Club', 'description' => 'Completed 100 donations. A truly legendary supporter!', 'criteria_type' => 'donation_count', 'criteria_value' => 100, 'min_points' => 0, 'display_order' => 5],

            // Donation total milestones (criteria_value in cents)
            ['code' => 'helping_hand', 'name' => 'Helping Hand', 'description' => 'Donated a total of $25 or more. Every bit counts!', 'criteria_type' => 'donation_total', 'criteria_value' => 2500, 'min_points' => 25, 'display_order' => 6],
            ['code' => 'bronze_supporter', 'name' => 'Bronze Supporter', 'description' => 'Donated a total of $100 or more. Your generosity matters!', 'criteria_type' => 'donation_total', 'criteria_value' => 10000, 'min_points' => 100, 'display_order' => 7],
            ['code' => 'generous_spirit', 'name' => 'Generous Spirit', 'description' => 'Donated a total of $250 or more. A generous heart!', 'criteria_type' => 'donation_total', 'criteria_value' => 25000, 'min_points' => 250, 'display_order' => 8],
            ['code' => 'silver_supporter', 'name' => 'Silver Supporter', 'description' => 'Donated a total of $500 or more. A true force for good.', 'criteria_type' => 'donation_total', 'criteria_value' => 50000, 'min_points' => 500, 'display_order' => 9],
            ['code' => 'gold_supporter', 'name' => 'Gold Supporter', 'description' => 'Donated a total of $1,000 or more. An extraordinary impact.', 'criteria_type' => 'donation_total', 'criteria_value' => 100000, 'min_points' => 1000, 'display_order' => 10],
            ['code' => 'philanthropist', 'name' => 'Philanthropist', 'description' => 'Donated a total of $5,000 or more. A legendary contributor.', 'criteria_type' => 'donation_total', 'criteria_value' => 500000, 'min_points' => 5000, 'display_order' => 11],
            ['code' => 'platinum_donor', 'name' => 'Platinum Donor', 'description' => 'Donated a total of $10,000 or more. Truly extraordinary generosity!', 'criteria_type' => 'donation_total', 'criteria_value' => 1000000, 'min_points' => 10000, 'display_order' => 12],
            ['code' => 'diamond_benefactor', 'name' => 'Diamond Benefactor', 'description' => 'Donated a total of $25,000 or more. Among the greatest benefactors!', 'criteria_type' => 'donation_total', 'criteria_value' => 2500000, 'min_points' => 25000, 'display_order' => 13],

            // Campaign diversity milestones
            ['code' => 'trailblazer', 'name' => 'Trailblazer', 'description' => 'Donated to 3 or more different campaigns. Exploring new causes!', 'criteria_type' => 'campaign_count', 'criteria_value' => 3, 'min_points' => 0, 'display_order' => 14],
            ['code' => 'campaign_champion', 'name' => 'Campaign Champion', 'description' => 'Donated to 5 or more different campaigns. Spreading the love!', 'criteria_type' => 'campaign_count', 'criteria_value' => 5, 'min_points' => 0, 'display_order' => 15],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->updateOrInsert(
                ['code' => $badge['code']],
                array_merge($badge, [
                    'icon_url' => 'https://ui-avatars.com/api/?name=' . urlencode($badge['name']) . '&background=ffedd5&color=ea580c&bold=true&size=64',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }

    public function down(): void
    {
        DB::table('badges')->whereIn('code', [
            'first_step', 'frequent_donor', 'dedicated_donor', 'community_pillar', 'century_club',
            'helping_hand', 'bronze_supporter', 'generous_spirit', 'silver_supporter', 'gold_supporter',
            'philanthropist', 'platinum_donor', 'diamond_benefactor',
            'trailblazer', 'campaign_champion',
        ])->delete();
    }
};
