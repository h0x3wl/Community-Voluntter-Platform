<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\PointsLedger;
use App\Models\RewardRule;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RewardService
{
    /**
     * Award points AND update XP/level for a donation.
     * Also updates the user's total_donated_cents and donation_count.
     */
    public function awardDonationPoints(Donation $donation): void
    {
        $rule = RewardRule::where('code', 'donation_points')->where('is_active', true)->first();
        $pointsPerUsd = data_get($rule?->config, 'points_per_usd', 1);
        $points = (int) round(($donation->amount_cents / 100) * $pointsPerUsd);

        if ($points <= 0 || ! $donation->donor) {
            return;
        }

        $this->addPoints($donation->donor, $points, 'donation', $donation->id, 'Donation reward points');

        // Update the user's profile aggregates
        $user = $donation->donor;
        $user->increment('total_donated_cents', $donation->amount_cents);
        $user->increment('donation_count');

        // Award XP and recalculate level
        $xpEarned = $this->calculateXp($donation->amount_cents);
        $user->increment('xp', $xpEarned);
        $newLevel = $this->calculateLevel($user->fresh()->xp);
        $user->update(['level' => $newLevel]);

        // Evaluate Badges
        $this->evaluateBadges($user->fresh());
    }

    private function evaluateBadges(User $user): void
    {
        $totalDonatedCents = $user->total_donated_cents;
        $donationCount = $user->donation_count;

        // Count unique campaigns this user has donated to
        $uniqueCampaigns = \App\Models\Donation::where('donor_user_id', $user->id)
            ->where('status', 'succeeded')
            ->whereNotNull('campaign_id')
            ->distinct('campaign_id')
            ->count('campaign_id');

        // Fetch all active badges from DB and check criteria
        $allBadges = \App\Models\Badge::where('is_active', true)->get();

        foreach ($allBadges as $badge) {
            $qualified = false;

            switch ($badge->criteria_type) {
                case 'donation_total':
                    $qualified = $totalDonatedCents >= $badge->criteria_value;
                    break;
                case 'donation_count':
                    $qualified = $donationCount >= $badge->criteria_value;
                    break;
                case 'campaign_count':
                    $qualified = $uniqueCampaigns >= $badge->criteria_value;
                    break;
            }

            if ($qualified) {
                $userBadge = \App\Models\UserBadge::firstOrCreate([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                ], [
                    'awarded_at' => now(),
                ]);

                // Notify only on first award (wasRecentlyCreated = true)
                if ($userBadge->wasRecentlyCreated) {
                    $user->notify(new \App\Notifications\BadgeUnlockedNotification($badge));
                }
            }
        }
    }

    public function addPoints(User $user, int $points, string $sourceType, ?int $sourceId, ?string $description, ?int $createdBy = null): void
    {
        DB::transaction(function () use ($user, $points, $sourceType, $sourceId, $description, $createdBy) {
            PointsLedger::create([
                'user_id' => $user->id,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'points' => $points,
                'description' => $description,
                'created_by' => $createdBy,
            ]);

            $user->increment('points_balance', $points);
        });
    }

    /**
     * Calculate XP earned from a donation amount in cents.
     * Every $1 = 10 XP. Bonus multipliers for larger donations.
     */
    private function calculateXp(int $amountCents): int
    {
        $dollars = $amountCents / 100;
        $baseXp = (int) round($dollars * 10);

        // Bonus tiers
        if ($dollars >= 100) {
            $baseXp = (int) round($baseXp * 1.5); // 50% bonus for $100+
        } elseif ($dollars >= 50) {
            $baseXp = (int) round($baseXp * 1.25); // 25% bonus for $50+
        }

        return max($baseXp, 1);
    }

    /**
     * Calculate level from total accumulated XP.
     * Level thresholds increase progressively.
     * Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, etc.
     */
    private function calculateLevel(int $totalXp): int
    {
        $level = 1;
        $threshold = 100;
        $remaining = $totalXp;

        while ($remaining >= $threshold) {
            $remaining -= $threshold;
            $level++;
            $threshold = (int) round($threshold * 1.5); // Progressive scaling
        }

        return $level;
    }
}
