<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Badge;
use App\Models\Campaign;
use App\Models\CampaignImage;
use App\Models\Category;
use App\Models\Donation;
use App\Models\ItemImage;
use App\Models\ItemListing;
use App\Models\ItemRequest;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\PointsLedger;
use App\Models\RewardRule;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\UserNotificationPreference;
use App\Models\VolunteerApplication;
use App\Models\VolunteerOpportunity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->truncateTables();

        $sampleIndex = 0;
        $nextSample = function (array $values) use (&$sampleIndex) {
            $value = $values[$sampleIndex % count($values)];
            $sampleIndex++;

            return $value;
        };

        $phoneNumbers = [
            '+1-555-0100',
            '+1-555-0101',
            '+1-555-0102',
            '+1-555-0103',
            '+1-555-0104',
            '+1-555-0105',
            '+1-555-0106',
            '+1-555-0107',
            '+1-555-0108',
            '+1-555-0109',
        ];
        $addresses = [
            '123 Oak Street',
            '456 Maple Avenue',
            '789 Pine Road',
            '101 Cedar Lane',
            '202 Birch Boulevard',
            '303 Elm Street',
            '404 Walnut Way',
            '505 Cherry Circle',
        ];
        $cities = [
            'Seattle',
            'Austin',
            'Denver',
            'Chicago',
            'Miami',
            'Portland',
            'Boston',
        ];
        $countries = [
            'United States',
            'Canada',
            'United Kingdom',
        ];
        $shortDescriptions = [
            'Community-focused nonprofit expanding access to vital services.',
            'Regional initiative providing critical relief resources.',
            'Volunteer-led organization supporting local families.',
            'Impact-driven team coordinating outreach programs.',
        ];
        $campaignTitles = [
            'Emergency Food Drive',
            'Backpack Fund for Students',
            'Community Health Outreach',
            'Winter Shelter Support',
            'Rapid Response Relief',
            'Neighborhood Rebuild Project',
        ];
        $campaignDescriptions = [
            'Funding essential supplies for families in urgent need.',
            'Supporting access to learning tools and mentorship resources.',
            'Covering medical outreach events and wellness kits.',
            'Providing warmth and safety resources during cold months.',
            'Delivering fast relief to impacted communities.',
        ];
        $opportunityTitles = [
            'Meal Kit Packing',
            'Community Tutor Session',
            'Supply Distribution',
            'Virtual Outreach Coordinator',
        ];
        $opportunityDescriptions = [
            'Assist the team with packaging and organizing supplies.',
            'Support students with guided tutoring sessions.',
            'Coordinate logistics for distributing donated items.',
            'Help manage virtual outreach and volunteer scheduling.',
        ];
        $skills = ['Coordination', 'Communication', 'Logistics', 'Teaching', 'Outreach', 'Organization'];
        $itemTitles = [
            'Box of Winter Coats',
            'Gently Used Laptops',
            'School Supply Kits',
            'Canned Food Assortment',
            'Hygiene Essentials Pack',
            'Blanket Bundle',
        ];
        $itemDescriptions = [
            'Clean and ready for immediate distribution.',
            'Well-maintained items suitable for donation.',
            'Packaged supplies for multiple recipients.',
            'Organized and ready for pickup.',
        ];
        $notes = [
            'Applicant has prior volunteer experience.',
            'Strong communication skills and availability.',
            'Recommended by organization member.',
        ];
        $pointsDescriptions = [
            'Volunteer participation points awarded.',
            'Campaign contribution points applied.',
            'Item verification points recorded.',
            'Donation bonus points added.',
        ];

        $admin = User::create([
            'public_id' => Str::uuid(),
            'first_name' => 'Platform',
            'last_name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'platform_admin',
            'points_balance' => 0,
        ]);

        $testUser = User::create([
            'public_id' => Str::uuid(),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password',
            'points_balance' => 0,
        ]);

        $users = collect();
        $userSeeds = [
            ['first_name' => 'Jordan', 'last_name' => 'Lee', 'email' => 'jordan.lee@example.com'],
            ['first_name' => 'Taylor', 'last_name' => 'Morgan', 'email' => 'taylor.morgan@example.com'],
            ['first_name' => 'Casey', 'last_name' => 'Nguyen', 'email' => 'casey.nguyen@example.com'],
            ['first_name' => 'Riley', 'last_name' => 'Patel', 'email' => 'riley.patel@example.com'],
            ['first_name' => 'Avery', 'last_name' => 'Kim', 'email' => 'avery.kim@example.com'],
            ['first_name' => 'Drew', 'last_name' => 'Garcia', 'email' => 'drew.garcia@example.com'],
            ['first_name' => 'Quinn', 'last_name' => 'Lopez', 'email' => 'quinn.lopez@example.com'],
            ['first_name' => 'Morgan', 'last_name' => 'Hill', 'email' => 'morgan.hill@example.com'],
            ['first_name' => 'Skyler', 'last_name' => 'Reed', 'email' => 'skyler.reed@example.com'],
            ['first_name' => 'Jamie', 'last_name' => 'Brooks', 'email' => 'jamie.brooks@example.com'],
            ['first_name' => 'Emerson', 'last_name' => 'Wright', 'email' => 'emerson.wright@example.com'],
            ['first_name' => 'Rowan', 'last_name' => 'Price', 'email' => 'rowan.price@example.com'],
        ];

        foreach ($userSeeds as $index => $seed) {
            $users->push(User::create([
                'public_id' => Str::uuid(),
                'first_name' => $seed['first_name'],
                'last_name' => $seed['last_name'],
                'email' => $seed['email'],
                'password' => 'password',
                'phone' => $phoneNumbers[$index % count($phoneNumbers)],
                'address_line' => $addresses[$index % count($addresses)],
                'last_login_at' => now()->subDays($index * 2),
                'points_balance' => 0,
            ]));
        }

        $allUsers = $users->concat([$admin, $testUser]);

        foreach ($allUsers as $index => $user) {
            UserNotificationPreference::create([
                'user_id' => $user->id,
                'email_notifications' => true,
                'sms_alerts' => $index % 3 === 0,
                'push_notifications' => $index % 2 === 0,
            ]);
        }

        $categories = collect([
            ['name' => 'Disaster Relief', 'slug' => 'disaster-relief', 'type' => 'campaign'],
            ['name' => 'Education', 'slug' => 'education', 'type' => 'campaign'],
            ['name' => 'Medical Aid', 'slug' => 'medical-aid', 'type' => 'campaign'],
            ['name' => 'Supplies', 'slug' => 'supplies', 'type' => 'item'],
            ['name' => 'Clothing', 'slug' => 'clothing', 'type' => 'item'],
            ['name' => 'Mentorship', 'slug' => 'mentorship', 'type' => 'opportunity'],
            ['name' => 'Community Cleanup', 'slug' => 'community-cleanup', 'type' => 'opportunity'],
        ])->map(fn ($category) => Category::create($category));

        $organizations = collect([
            ['name' => 'Hope Foundation', 'slug' => 'hope-foundation'],
            ['name' => 'Bright Futures', 'slug' => 'bright-futures'],
            ['name' => 'Unity Aid', 'slug' => 'unity-aid'],
        ])->map(function (array $org) use ($nextSample, $shortDescriptions, $cities, $countries, $phoneNumbers, $addresses) {
            return Organization::create([
                'public_id' => $org['slug'] === 'hope-foundation' ? 'demo-org-123' : Str::uuid(),
                'name' => $org['name'],
                'slug' => $org['slug'],
                'description' => $nextSample($shortDescriptions),
                'logo_url' => 'https://picsum.photos/seed/' . Str::slug($org['slug']) . '/200/200',
                'website' => 'https://example.org/' . $org['slug'],
                'phone' => $nextSample($phoneNumbers),
                'address' => $nextSample($addresses),
                'city' => $nextSample($cities),
                'country' => $nextSample($countries),
                'lat' => $nextSample([47.6062, 30.2672, 39.7392, 41.8781, 25.7617]),
                'lng' => $nextSample([-122.3321, -97.7431, -104.9903, -87.6298, -80.1918]),
                'status' => 'approved',
            ]);
        });

        foreach ($organizations as $organization) {
            OrganizationMember::create([
                'organization_id' => $organization->id,
                'user_id' => $admin->id,
                'role' => 'owner',
                'invited_by_user_id' => $admin->id,
                'joined_at' => now()->subDays(10),
            ]);

            $members = $allUsers->reject(fn (User $user) => $user->id === $admin->id)->values();
            foreach ($members->take(3) as $member) {
                OrganizationMember::create([
                    'organization_id' => $organization->id,
                    'user_id' => $member->id,
                    'role' => $nextSample(['manager', 'editor', 'viewer']),
                    'invited_by_user_id' => $admin->id,
                    'joined_at' => now()->subDays($nextSample([3, 5, 9, 12, 16])),
                ]);
            }
        }

        $campaignCategories = $categories->where('type', 'campaign');
        $campaigns = collect();

        foreach ($organizations as $organization) {
            for ($i = 0; $i < 3; $i++) {
                $title = $nextSample($campaignTitles);
                $campaign = Campaign::create([
                    'public_id' => Str::uuid(),
                    'organization_id' => $organization->id,
                    'category_id' => $campaignCategories->random()->id,
                    'title' => $title,
                    'description' => $nextSample($campaignDescriptions),
                    'location_text' => $nextSample($cities),
                    'lat' => $nextSample([34.0522, 32.7767, 36.1627, 39.9612, 33.4484]),
                    'lng' => $nextSample([-118.2437, -96.7970, -86.7816, -82.9988, -112.0740]),
                    'goal_cents' => $nextSample([50000, 75000, 125000, 175000, 250000]),
                    'raised_cents' => 0,
                    'donors_count' => 0,
                    'status' => $nextSample(['active', 'paused', 'completed']),
                    'approved_by' => $admin->id,
                    'approved_at' => now()->subDays($nextSample([12, 18, 25, 32, 40])),
                    'starts_at' => now()->subDays($nextSample([6, 10, 14, 18])),
                    'ends_at' => now()->addDays($nextSample([20, 30, 45, 60])),
                    'share_slug' => Str::slug($title) . '-' . Str::lower(Str::random(6)),
                ]);

                $campaigns->push($campaign);

                foreach (range(1, 2) as $order) {
                    CampaignImage::create([
                        'campaign_id' => $campaign->id,
                        'image_url' => 'https://picsum.photos/seed/campaign-' . $campaign->id . '-' . $order . '/800/600',
                        'sort_order' => $order - 1,
                    ]);
                }
            }
        }

        $donations = collect();

        foreach ($campaigns as $campaign) {
            foreach (range(1, 3) as $_) {
                $donor = $allUsers->get($sampleIndex % $allUsers->count());
                $donations->push(Donation::create([
                    'public_id' => Str::uuid(),
                    'campaign_id' => $campaign->id,
                    'organization_id' => $campaign->organization_id,
                    'donor_user_id' => $donor->id,
                    'donor_name' => $donor->first_name . ' ' . $donor->last_name,
                    'donor_email' => $donor->email,
                    'amount_cents' => $nextSample([2500, 5000, 7500, 10000, 15000]),
                    'currency' => 'USD',
                    'frequency' => $nextSample(['one_time', 'monthly']),
                    'status' => 'succeeded',
                    'stripe_payment_intent_id' => 'pi_' . Str::random(12),
                    'stripe_charge_id' => 'ch_' . Str::random(12),
                    'paid_at' => now()->subDays($nextSample([2, 5, 9, 15, 21, 28])),
                    'receipt_url' => 'https://example.org/receipts/' . Str::lower(Str::random(10)),
                ]));
            }
        }

        foreach ($organizations as $organization) {
            $donor = $allUsers->get($sampleIndex % $allUsers->count());
            $donations->push(Donation::create([
                'public_id' => Str::uuid(),
                'campaign_id' => null,
                'organization_id' => $organization->id,
                'donor_user_id' => $donor->id,
                'donor_name' => $donor->first_name . ' ' . $donor->last_name,
                'donor_email' => $donor->email,
                'amount_cents' => $nextSample([3000, 6000, 9000, 12000]),
                'currency' => 'USD',
                'frequency' => 'one_time',
                'status' => 'succeeded',
                'stripe_payment_intent_id' => 'pi_' . Str::random(12),
                'stripe_charge_id' => 'ch_' . Str::random(12),
                'paid_at' => now()->subDays($nextSample([2, 4, 6, 9, 12])),
                'receipt_url' => 'https://example.org/receipts/' . Str::lower(Str::random(10)),
            ]));
        }

        foreach ($campaigns as $campaign) {
            $campaignDonations = $donations->where('campaign_id', $campaign->id);
            $campaign->update([
                'raised_cents' => $campaignDonations->sum('amount_cents'),
                'donors_count' => $campaignDonations->count(),
            ]);
        }

        $opportunities = collect();
        foreach ($organizations as $organization) {
            foreach (range(1, 2) as $_) {
                $isRemote = $nextSample([true, false, false]);
                $opportunity = VolunteerOpportunity::create([
                    'public_id' => Str::uuid(),
                    'organization_id' => $organization->id,
                    'title' => $nextSample($opportunityTitles),
                    'description' => $nextSample($opportunityDescriptions),
                    'required_skills' => [$nextSample($skills), $nextSample($skills)],
                    'location_type' => $isRemote ? 'remote' : 'onsite',
                    'location_text' => $isRemote ? null : $nextSample($addresses) . ', ' . $nextSample($cities),
                    'start_date' => now()->addDays($nextSample([7, 10, 14, 18]))->toDateString(),
                    'end_date' => now()->addDays($nextSample([25, 30, 35, 40]))->toDateString(),
                    'duration_hours' => $nextSample([3, 4, 6, 8, 10, 12]),
                    'session_title' => $isRemote ? $nextSample(['Orientation', 'Weekly Sync', 'Training Session']) : null,
                    'session_starts_at' => $isRemote ? now()->addDays(5)->setTime(14, 0) : null,
                    'session_timezone' => $isRemote ? 'UTC' : null,
                    'session_join_url' => $isRemote ? 'https://example.org/volunteer/' . Str::lower(Str::random(8)) : null,
                    'status' => 'active',
                    'approved_by' => $admin->id,
                    'approved_at' => now()->subDays(5),
                ]);

                $opportunities->push($opportunity);
            }
        }

        foreach ($opportunities as $opportunity) {
            $applicants = $allUsers->take(2);
            foreach ($applicants as $applicant) {
                VolunteerApplication::create([
                    'public_id' => Str::uuid(),
                    'opportunity_id' => $opportunity->id,
                    'user_id' => $applicant->id,
                    'full_name' => $applicant->first_name . ' ' . $applicant->last_name,
                    'email' => $applicant->email,
                    'phone' => $nextSample($phoneNumbers),
                    'skills_text' => $nextSample($skills) . ', ' . $nextSample($skills),
                    'experience_text' => $nextSample($opportunityDescriptions),
                    'availability_text' => 'Weekends',
                    'status' => $nextSample(['pending', 'accepted', 'rejected']),
                    'reviewed_by' => $admin->id,
                    'reviewed_at' => now()->subDays($nextSample([1, 2, 3, 4, 5])),
                    'notes' => $nextSample($notes),
                ]);
            }
        }

        $itemCategories = $categories->where('type', 'item');
        $itemListings = collect();

        foreach (range(1, 8) as $_) {
            $donor = $allUsers->get($sampleIndex % $allUsers->count());
            $listing = ItemListing::create([
                'public_id' => Str::uuid(),
                'donor_user_id' => $donor->id,
                'category_id' => $itemCategories->random()->id,
                'title' => $nextSample($itemTitles),
                'description' => $nextSample($itemDescriptions),
                'condition' => $nextSample(['new', 'good', 'fair']),
                'location_text' => $nextSample($cities),
                'lat' => $nextSample([40.7128, 33.7490, 45.5152, 29.7604, 38.9072]),
                'lng' => $nextSample([-74.0060, -84.3880, -122.6784, -95.3698, -77.0369]),
                'status' => $nextSample(['pending_review', 'active', 'completed']),
                'approved_by' => $admin->id,
                'approved_at' => now()->subDays(3),
            ]);

            $itemListings->push($listing);

            foreach (range(1, 2) as $order) {
                ItemImage::create([
                    'item_listing_id' => $listing->id,
                    'image_url' => 'https://picsum.photos/seed/item-' . $listing->id . '-' . $order . '/800/600',
                    'sort_order' => $order - 1,
                ]);
            }
        }

        foreach ($itemListings as $listing) {
            $organization = $organizations->first();
            ItemRequest::create([
                'public_id' => Str::uuid(),
                'item_listing_id' => $listing->id,
                'organization_id' => $organization->id,
                'requested_by_user_id' => $allUsers->get($sampleIndex % $allUsers->count())->id,
                'status' => $nextSample(['pending', 'accepted', 'rejected', 'delivered']),
                'decided_by' => $admin->id,
                'decided_at' => now()->subDays(1),
                'delivery_notes' => $nextSample($itemDescriptions),
            ]);
        }

        $rewardRules = collect([
            ['code' => 'donation_points', 'config' => ['points_per_usd' => 1], 'is_active' => true],
            ['code' => 'item_verified_points', 'config' => ['points' => 50], 'is_active' => true],
            ['code' => 'volunteer_hours', 'config' => ['points_per_hour' => 10], 'is_active' => true],
            ['code' => 'campaign_goal_bonus', 'config' => ['points' => 200], 'is_active' => false],
        ])->map(fn ($rule) => RewardRule::create($rule));

        $badges = collect([
            ['code' => 'bronze_supporter', 'name' => 'Bronze Supporter', 'min_points' => 100],
            ['code' => 'silver_supporter', 'name' => 'Silver Supporter', 'min_points' => 500],
            ['code' => 'gold_supporter', 'name' => 'Gold Supporter', 'min_points' => 1000],
        ])->map(function (array $badge) {
            return Badge::create(array_merge($badge, [
                'icon_url' => 'https://picsum.photos/seed/badge-' . $badge['code'] . '/64/64',
            ]));
        });

        foreach ($allUsers as $user) {
            foreach (range(1, 2) as $_) {
                $rule = $rewardRules->random();
                PointsLedger::create([
                    'user_id' => $user->id,
                    'source_type' => $rule->code,
                    'source_id' => null,
                    'points' => $nextSample([10, 25, 50, 75, 100, 150]),
                    'description' => $nextSample($pointsDescriptions),
                    'created_by' => $admin->id,
                ]);
            }
        }

        foreach ($allUsers->take(5) as $index => $user) {
            $badge = $badges->get(min($index, $badges->count() - 1));
            UserBadge::create([
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'awarded_at' => now()->subDays($index + 1),
            ]);
        }

        foreach ($allUsers as $user) {
            $points = PointsLedger::where('user_id', $user->id)->sum('points');
            $user->update(['points_balance' => $points]);
        }

        foreach (range(1, 3) as $_) {
            StripeWebhookEvent::create([
                'stripe_event_id' => 'evt_' . Str::random(14),
                'type' => $nextSample(['payment_intent.succeeded', 'charge.refunded', 'invoice.paid']),
                'payload' => ['data' => ['object' => ['id' => 'pi_' . Str::random(12)]]],
                'processed_at' => now()->subMinutes($nextSample([10, 35, 60, 90, 120])),
            ]);
        }

        foreach ($campaigns->take(6) as $campaign) {
            AuditLog::create([
                'actor_user_id' => $admin->id,
                'action' => 'status_updated',
                'entity_type' => 'campaign',
                'entity_id' => $campaign->id,
                'before' => ['status' => 'pending_review'],
                'after' => ['status' => $campaign->status],
            ]);
        }

        foreach ($itemListings->take(4) as $listing) {
            AuditLog::create([
                'actor_user_id' => $admin->id,
                'action' => 'item_reviewed',
                'entity_type' => 'item_listing',
                'entity_id' => $listing->id,
                'before' => ['status' => 'pending_review'],
                'after' => ['status' => $listing->status],
            ]);
        }
    }

    private function truncateTables(): void
    {
        $driver = DB::getDriverName();

        $tables = [
            'audit_logs',
            'user_badges',
            'points_ledger',
            'reward_rules',
            'badges',
            'donations',
            'campaign_images',
            'campaigns',
            'item_images',
            'item_requests',
            'item_listings',
            'volunteer_applications',
            'volunteer_opportunities',
            'organization_members',
            'organizations',
            'categories',
            'stripe_webhook_events',
            'user_notification_preferences',
            'personal_access_tokens',
            'users',
        ];

        if ($driver === 'pgsql') {
            $prefixedTables = array_map(
                fn (string $table) => DB::getTablePrefix() . $table,
                $tables
            );
            DB::statement('TRUNCATE TABLE ' . implode(', ', $prefixedTables) . ' RESTART IDENTITY CASCADE');

            return;
        }

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        if ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
