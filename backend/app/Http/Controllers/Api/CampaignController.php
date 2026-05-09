<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Campaigns\CampaignIndexRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Support\Facades\Cache;

class CampaignController extends ApiController
{
    public function index(CampaignIndexRequest $request)
    {
        // Build a cache key based on the query parameters
        $cacheKey = 'campaigns_index_' . md5($request->fullUrl());
        $cacheTTL = 300; // 5 minutes

        // Only cache when there are no special filters (public listing)
        $canCache = !$request->input('q') && !$request->input('category') && !$request->input('status') && !$request->input('sort');

        if ($canCache) {
            $result = Cache::remember($cacheKey, $cacheTTL, function () use ($request) {
                return $this->buildCampaignIndex($request);
            });
            return $result;
        }

        return $this->buildCampaignIndex($request);
    }

    /**
     * Build the campaign index query and response.
     */
    private function buildCampaignIndex(CampaignIndexRequest $request)
    {
        $query = Campaign::query()->with(['organization', 'category', 'images']);

        if ($search = $request->input('q')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        // Only show active campaigns on public listing (unless explicitly filtered)
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        } else {
            $query->where('status', 'active');
        }

        if ($sort = $request->input('sort')) {
            $query->orderByDesc('is_urgent')->orderBy($sort === 'raised' ? 'raised_cents' : 'created_at', 'desc');
        } else {
            $query->orderByDesc('is_urgent')->latest();
        }

        $campaigns = $query->paginate(15);

        return $this->respond(CampaignResource::collection($campaigns), [
            'pagination' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    public function show(string $shareSlug)
    {
        // Cache individual campaign detail pages for 2 minutes
        $cacheKey = 'campaign_detail_' . $shareSlug;

        return Cache::remember($cacheKey, 120, function () use ($shareSlug) {
            $campaign = Campaign::with(['organization', 'category', 'images', 'donations' => function ($q) {
                    $q->where('status', 'succeeded')
                      ->latest('paid_at')
                      ->limit(20);
                }])
                ->where('share_slug', $shareSlug)
                ->firstOrFail();

            $resource = (new CampaignResource($campaign))->toArray(request());

            // Build recent_donors from the loaded donations
            $recentDonors = $campaign->donations->map(function ($d) {
                return [
                    'name' => $d->is_anonymous ? 'Anonymous' : ($d->donor_name ?: 'Supporter'),
                    'amount' => round($d->amount_cents / 100, 2),
                    'time' => optional($d->paid_at)->diffForHumans() ?? 'Recently',
                ];
            });

            $resource['recent_donors'] = $recentDonors;

            return $this->respond($resource);
        });
    }
}
