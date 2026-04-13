<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\User\LeaderboardIndexRequest;
use App\Models\Donation;
use App\Models\User;
use Carbon\Carbon;

class LeaderboardController extends ApiController
{
    public function index(LeaderboardIndexRequest $request)
    {
        $range = $request->input('range', 'monthly');

        // Build base query on succeeded donations
        $query = Donation::where('status', 'succeeded')
            ->whereNotNull('donor_user_id');

        if ($range === 'weekly') {
            $query->where('paid_at', '>=', Carbon::now()->startOfWeek());
        } elseif ($range === 'monthly') {
            $query->where('paid_at', '>=', Carbon::now()->startOfMonth());
        }
        // 'all_time' uses no date filter

        // Rank by total donated amount
        $leaders = $query->selectRaw('donor_user_id, SUM(amount_cents) as total_cents, COUNT(*) as donation_count')
            ->groupBy('donor_user_id')
            ->orderByDesc('total_cents')
            ->limit(20)
            ->get();

        $entries = $leaders->map(function ($row, $index) {
            $user = User::find($row->donor_user_id);

            // Anonymity check: user is anonymous on leaderboard only if their
            // most recent succeeded donation was marked anonymous.
            // This gives per-donation control — a public donation reveals them again.
            $latestDonation = Donation::where('donor_user_id', $row->donor_user_id)
                ->where('status', 'succeeded')
                ->latest('paid_at')
                ->first();
            $isAnonymous = $latestDonation?->is_anonymous ?? false;

            $displayName = 'Anonymous';
            if ($user && !$isAnonymous) {
                $displayName = $user->first_name . ' ' . $user->last_name;
            } elseif ($user && $isAnonymous) {
                $displayName = 'Anonymous Donor';
            }

            return [
                'user_public_id' => $isAnonymous ? null : $user?->public_id,
                'name' => $displayName,
                'total_donated' => (int) $row->total_cents,
                'donation_count' => (int) $row->donation_count,
                'points' => $user?->points_balance ?? 0,
                'rank' => $index + 1,
                'level' => $user?->level ?? 1,
                'image' => $isAnonymous ? null : $user?->avatar_url,
            ];
        });

        // Find current user's rank
        $currentUser = request()->user();
        $currentUserRank = null;
        $currentUserTotal = 0;
        if ($currentUser) {
            $ranked = (clone $query)->selectRaw('donor_user_id, SUM(amount_cents) as total_cents')
                ->groupBy('donor_user_id')
                ->orderByDesc('total_cents')
                ->pluck('donor_user_id')
                ->toArray();
            $position = array_search($currentUser->id, $ranked, true);
            $currentUserRank = $position === false ? null : $position + 1;
            $currentUserTotal = $currentUser->total_donated_cents ?? 0;
        }

        return $this->respond([
            'leaders' => $entries,
            'current_user_rank' => $currentUserRank,
            'current_user_total' => $currentUserTotal,
        ]);
    }
}

