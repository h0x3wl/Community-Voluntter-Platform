<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\VolunteerApplication;
use Carbon\Carbon;

class ImpactService
{
    public function buildMetrics(int $userId, string $month): array
    {
        $monthDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $monthDate->copy()->endOfMonth();

        $donations = Donation::where('donor_user_id', $userId)
            ->where('status', 'succeeded')
            ->whereBetween('paid_at', [$monthDate, $end]);

        $donationTotal = (int) $donations->sum('amount_cents');
        $volunteerHours = (int) VolunteerApplication::where('user_id', $userId)
            ->where('status', 'completed')
            ->count() * 2;

        $livesImpacted = (int) round($donationTotal / 5000);
        $treesPlanted = (int) round($donationTotal / 1000);

        $goal = 10000;
        $progress = min(1, $donationTotal / $goal);

        return [
            'lives_impacted' => $livesImpacted,
            'volunteer_hours' => $volunteerHours,
            'trees_planted' => $treesPlanted,
            'monthly_goal_progress' => [
                'goal_cents' => $goal,
                'current_cents' => $donationTotal,
                'progress_ratio' => $progress,
            ],
            'milestones' => [
                ['label' => 'Bronze Helper', 'threshold_cents' => 2500, 'achieved' => $donationTotal >= 2500],
                ['label' => 'Silver Helper', 'threshold_cents' => 5000, 'achieved' => $donationTotal >= 5000],
                ['label' => 'Gold Helper', 'threshold_cents' => 10000, 'achieved' => $donationTotal >= 10000],
            ],
            'highlights' => [
                ['message' => 'Thank you for supporting a campaign this month!', 'date' => $monthDate->toDateString()],
            ],
        ];
    }
}
