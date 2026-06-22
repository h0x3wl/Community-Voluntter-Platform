<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Category;
use App\Models\RewardRule;
use Illuminate\Database\Seeder;

/**
 * Seeds ONLY system configuration data (categories, reward rules, badges).
 * No fake users, organizations, campaigns, or donations.
 *
 * Usage: php artisan migrate:fresh --seed --seeder=SystemSeeder
 */
class SystemSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedCategories();
        $this->seedRewardRules();
        $this->seedBadges();
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name' => 'Disaster Relief', 'slug' => 'disaster-relief', 'type' => 'campaign'],
            ['name' => 'Education', 'slug' => 'education', 'type' => 'campaign'],
            ['name' => 'Medical Aid', 'slug' => 'medical-aid', 'type' => 'campaign'],
            ['name' => 'Supplies', 'slug' => 'supplies', 'type' => 'item'],
            ['name' => 'Clothing', 'slug' => 'clothing', 'type' => 'item'],
            ['name' => 'Mentorship', 'slug' => 'mentorship', 'type' => 'opportunity'],
            ['name' => 'Community Cleanup', 'slug' => 'community-cleanup', 'type' => 'opportunity'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }

    private function seedRewardRules(): void
    {
        $rules = [
            ['code' => 'donation_points', 'config' => ['points_per_usd' => 1], 'is_active' => true],
            ['code' => 'item_verified_points', 'config' => ['points' => 50], 'is_active' => true],
            ['code' => 'volunteer_hours', 'config' => ['points_per_hour' => 10], 'is_active' => true],
            ['code' => 'campaign_goal_bonus', 'config' => ['points' => 200], 'is_active' => false],
        ];

        foreach ($rules as $rule) {
            RewardRule::create($rule);
        }
    }

    private function seedBadges(): void
    {
        $badges = [
            // Donation count milestones
            ['code' => 'first_step', 'name' => 'First Step', 'description' => 'Made your very first donation. Welcome to the community!', 'criteria_type' => 'donation_count', 'criteria_value' => 1, 'min_points' => 0, 'display_order' => 1],
            ['code' => 'frequent_donor', 'name' => 'Frequent Donor', 'description' => 'Completed 5 or more donations. Consistency is key!', 'criteria_type' => 'donation_count', 'criteria_value' => 5, 'min_points' => 0, 'display_order' => 2],
            ['code' => 'dedicated_donor', 'name' => 'Dedicated Donor', 'description' => 'Completed 10 or more donations. True dedication!', 'criteria_type' => 'donation_count', 'criteria_value' => 10, 'min_points' => 0, 'display_order' => 3],
            ['code' => 'community_pillar', 'name' => 'Community Pillar', 'description' => 'Completed 20 or more donations. A pillar of our community.', 'criteria_type' => 'donation_count', 'criteria_value' => 20, 'min_points' => 0, 'display_order' => 4],
            ['code' => 'century_club', 'name' => 'Century Club', 'description' => 'Completed 100 donations. A truly legendary supporter!', 'criteria_type' => 'donation_count', 'criteria_value' => 100, 'min_points' => 0, 'display_order' => 5],

            // Donation total milestones
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
            Badge::create(array_merge($badge, [
                'icon_url' => 'https://ui-avatars.com/api/?name=' . urlencode($badge['name']) . '&background=ffedd5&color=ea580c&bold=true&size=64',
                'is_active' => true,
            ]));
        }
    }
}
