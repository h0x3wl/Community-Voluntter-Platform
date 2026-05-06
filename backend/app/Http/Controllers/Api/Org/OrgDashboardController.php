<?php

namespace App\Http\Controllers\Api\Org;

use App\Http\Controllers\Api\ApiController;
use App\Models\Donation;
use App\Models\Organization;
use Carbon\Carbon;

class OrgDashboardController extends ApiController
{
    public function overview(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $activeCampaigns = $org->campaigns()->where('status', 'active')->count();
        $fundsThisMonth = Donation::where('organization_id', $org->id)
            ->where('status', 'succeeded')
            ->where('paid_at', '>=', $currentMonth)
            ->sum('amount_cents');
        $fundsLastMonth = Donation::where('organization_id', $org->id)
            ->where('status', 'succeeded')
            ->whereBetween('paid_at', [$lastMonth, $currentMonth])
            ->sum('amount_cents');

        $activeDonors = Donation::where('organization_id', $org->id)
            ->where('status', 'succeeded')
            ->where('paid_at', '>=', $currentMonth)
            ->distinct('donor_user_id')
            ->count('donor_user_id');

        $fundsDelta = $fundsLastMonth > 0 ? (($fundsThisMonth - $fundsLastMonth) / $fundsLastMonth) * 100 : null;

        // Annual raised (current calendar year)
        $yearStart = Carbon::now()->startOfYear();
        $annualRaised = Donation::where('organization_id', $org->id)
            ->where('status', 'succeeded')
            ->where('paid_at', '>=', $yearStart)
            ->sum('amount_cents');

        return $this->respond([
            'total_active_campaigns' => $activeCampaigns,
            'funds_raised_month' => $fundsThisMonth,
            'active_donors' => $activeDonors,
            'funds_delta_percent' => $fundsDelta,
            'annual_goal_cents' => (int) ($org->annual_goal_cents ?? 0),
            'annual_raised_cents' => (int) $annualRaised,
        ]);
    }

    public function finance(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        // Total raised this month (default range)
        $from = request()->query('from', Carbon::now()->startOfMonth()->toDateString());
        $to = request()->query('to', Carbon::now()->endOfMonth()->toDateString());

        $total = Donation::where('organization_id', $org->id)
            ->where('status', 'succeeded')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount_cents');

        // Monthly totals for the last 12 months (for the chart)
        $monthlyTotals = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();
            $monthTotal = Donation::where('organization_id', $org->id)
                ->where('status', 'succeeded')
                ->whereBetween('paid_at', [$monthStart, $monthEnd])
                ->sum('amount_cents');
            $monthlyTotals[] = [
                'month' => $monthStart->format('M'),
                'amount_cents' => (int) $monthTotal,
            ];
        }

        // Top campaigns by raised amount
        $topCampaigns = $org->campaigns()
            ->orderByDesc('raised_cents')
            ->limit(5)
            ->get(['title', 'status', 'raised_cents', 'goal_cents', 'public_id']);

        return $this->respond([
            'total_raised_cents' => $total,
            'from' => $from,
            'to' => $to,
            'monthly_totals' => $monthlyTotals,
            'top_campaigns' => $topCampaigns,
        ]);
    }

    public function donors(string $publicId)
    {
        $org = Organization::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $org);

        $from = request()->query('from');
        $to   = request()->query('to');

        $query = Donation::where('donations.organization_id', $org->id)
            ->where('donations.status', 'succeeded');

        if ($from && $to) {
            $query->whereBetween('donations.paid_at', [$from, $to]);
        }

        // Aggregate stats
        $totalCount       = (clone $query)->count();
        $totalAmountCents = (clone $query)->sum('donations.amount_cents');

        // Individual donation rows with real campaign title
        $donations = (clone $query)
            ->leftJoin('campaigns', 'campaigns.id', '=', 'donations.campaign_id')
            ->select([
                'donations.public_id',
                'donations.donor_name',
                'donations.donor_email',
                'donations.amount_cents',
                'donations.paid_at as donated_at',
                'donations.status',
                'campaigns.title as campaign_title',
            ])
            ->orderByDesc('donations.paid_at')
            ->limit(100)
            ->get()
            ->map(function ($d) {
                return [
                    'public_id'      => $d->public_id,
                    'donor_name'     => $d->donor_name ?: 'Anonymous',
                    'donor_email'    => $d->donor_email,
                    'amount_cents'   => (int) $d->amount_cents,
                    'campaign'       => $d->campaign_title ?: 'General Fund',
                    'donated_at'     => $d->donated_at,
                    'status'         => $d->status,
                ];
            });

        return $this->respond([
            'recent_donors'      => $donations,
            'total_count'        => $totalCount,
            'total_amount_cents' => (int) $totalAmountCents,
        ]);
    }
}
