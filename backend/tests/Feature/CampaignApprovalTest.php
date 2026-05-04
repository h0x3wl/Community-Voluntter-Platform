<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CampaignApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_admin_can_approve_campaign(): void
    {
        $admin = User::factory()->create(['role' => 'platform_admin']);
        $org = Organization::create([
            'public_id' => Str::uuid(),
            'name' => 'Hope Org',
            'slug' => 'hope-org',
            'status' => 'approved',
        ]);

        $campaign = Campaign::create([
            'public_id' => Str::uuid(),
            'organization_id' => $org->id,
            'title' => 'Relief Fund',
            'description' => 'Help now',
            'goal_cents' => 10000,
            'status' => 'pending_review',
            'share_slug' => 'relief-fund',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/campaigns/' . $campaign->public_id . '/approve');

        $response->assertOk();
        $this->assertEquals('approved', $campaign->refresh()->status);
    }
}
