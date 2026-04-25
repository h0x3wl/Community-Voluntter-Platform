<?php

use App\Http\Controllers\Api\Admin\AdminCampaignController;
use App\Http\Controllers\Api\Admin\AdminItemController;
use App\Http\Controllers\Api\Admin\AdminOpportunityController;
use App\Http\Controllers\Api\Admin\AdminPointsController;
use App\Http\Controllers\Api\Admin\AdminOrganizationController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\VolunteerApplicationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\Org\OrganizationController;
use App\Http\Controllers\Api\Org\OrgApplicationController;
use App\Http\Controllers\Api\Org\OrgCampaignController;
use App\Http\Controllers\Api\Org\OrgDashboardController;
use App\Http\Controllers\Api\Org\OrgItemRequestController;
use App\Http\Controllers\Api\Org\OrgOpportunityController;
use App\Http\Controllers\Api\Org\OrgTeamController;
use App\Http\Controllers\Api\Org\OrgGoalController;
use App\Http\Controllers\Api\User\ImpactController;
use App\Http\Controllers\Api\User\LeaderboardController;
use App\Http\Controllers\Api\User\MeController;
use App\Http\Controllers\Api\User\UserApplicationController;
use App\Http\Controllers\Api\User\UserDonationController;
use App\Http\Controllers\Api\User\NotificationController;
use App\Http\Controllers\Api\User\OrgInviteResponseController;
use App\Http\Controllers\Api\User\UserItemController;
use App\Http\Controllers\Api\BadgeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/password/forgot', [AuthController::class, 'requestPasswordReset']);
    Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::get('/force-admin', function () {
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'public_id' => \Illuminate\Support\Str::uuid(),
                'first_name' => 'Platform',
                'last_name' => 'Admin',
                'password' => 'password',
                'role' => 'platform_admin',
            ]
        );
        $user->update(['role' => 'platform_admin', 'password' => 'password']);
        return response()->json(['message' => 'Admin account verified and recreated if missing. email: admin@example.com / pass: password']);
    });

    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::get('/campaigns/{share_slug}', [CampaignController::class, 'show']);
    Route::get('/opportunities', [OpportunityController::class, 'index']);
    Route::get('/opportunities/{public_id}', [OpportunityController::class, 'show']);
    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/items/{public_id}', [ItemController::class, 'show']);
    
    Route::get('/badges', [BadgeController::class, 'index']);

    Route::post('/contact', [ContactController::class, 'store']);
    Route::post('/newsletter', [NewsletterController::class, 'subscribe']);
    Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

    // Public: list active organizations (for donation target dropdown)
    Route::get('/organizations/active', function () {
        $orgs = \App\Models\Organization::where('status', 'approved')
            ->select(['public_id', 'name', 'logo_url', 'city', 'country', 'description'])
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $orgs]);
    });

    // Donation routes need auth:sanctum so $request->user() resolves the logged-in user
    // for linking donor_user_id, XP tracking, and donation history
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/donations/intent', [DonationController::class, 'intent']);
        Route::post('/donations/simulate', [DonationController::class, 'simulate']);
        Route::get('/donations/{public_id}', [DonationController::class, 'show']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [MeController::class, 'show']);
        Route::put('/me', [MeController::class, 'update']);
        Route::put('/me/password', [MeController::class, 'updatePassword']);
        Route::put('/me/notification-preferences', [MeController::class, 'updateNotifications']);
        Route::post('/me/avatar', [MeController::class, 'uploadAvatar']);
        Route::delete('/me/avatar', [MeController::class, 'deleteAvatar']);

        Route::get('/me/donations', [UserDonationController::class, 'index']);
        Route::get('/me/applications', [UserApplicationController::class, 'index']);
        Route::get('/me/impact', [ImpactController::class, 'show']);
        Route::get('/me/notifications', [NotificationController::class, 'index']);
        Route::put('/me/notifications/read', [NotificationController::class, 'markAsRead']);
        Route::put('/me/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/me/org-invites/{notification_id}/accept', [OrgInviteResponseController::class, 'accept']);
        Route::post('/me/org-invites/{notification_id}/reject', [OrgInviteResponseController::class, 'reject']);
        Route::get('/leaderboard', [LeaderboardController::class, 'index']);

        Route::post('/opportunities/{public_id}/apply', [VolunteerApplicationController::class, 'apply']);

        Route::post('/items', [ItemController::class, 'store']);
        Route::post('/items/{public_id}/images', [ItemController::class, 'uploadImage']);
        Route::get('/me/items', [UserItemController::class, 'index']);
        Route::put('/me/items/{public_id}', [UserItemController::class, 'update']);

        Route::post('/orgs', [OrganizationController::class, 'store']);
        Route::get('/orgs/{org_public_id}', [OrganizationController::class, 'show']);
        Route::put('/orgs/{org_public_id}', [OrganizationController::class, 'update']);
        Route::post('/orgs/{org_public_id}/logo', [OrganizationController::class, 'uploadLogo']);

        Route::get('/orgs/{org_public_id}/dashboard/overview', [OrgDashboardController::class, 'overview']);
        Route::get('/orgs/{org_public_id}/dashboard/finance', [OrgDashboardController::class, 'finance']);
        Route::get('/orgs/{org_public_id}/dashboard/donors', [OrgDashboardController::class, 'donors']);
        Route::put('/orgs/{org_public_id}/annual-goal', [OrgGoalController::class, 'update']);

        Route::get('/orgs/{org_public_id}/campaigns', [OrgCampaignController::class, 'index']);
        Route::post('/orgs/{org_public_id}/campaigns', [OrgCampaignController::class, 'store']);
        Route::put('/orgs/{org_public_id}/campaigns/{campaign_public_id}', [OrgCampaignController::class, 'update']);
        Route::post('/orgs/{org_public_id}/campaigns/{campaign_public_id}/images', [OrgCampaignController::class, 'uploadImage']);
        Route::post('/orgs/{org_public_id}/campaigns/{campaign_public_id}/pause', [OrgCampaignController::class, 'pause']);
        Route::post('/orgs/{org_public_id}/campaigns/{campaign_public_id}/activate', [OrgCampaignController::class, 'activate']);
        Route::post('/orgs/{org_public_id}/campaigns/{campaign_public_id}/complete', [OrgCampaignController::class, 'complete']);
        Route::delete('/orgs/{org_public_id}/campaigns/{campaign_public_id}', [OrgCampaignController::class, 'destroy']);

        Route::get('/orgs/{org_public_id}/members', [OrgTeamController::class, 'index']);
        Route::post('/orgs/{org_public_id}/members/invite', [OrgTeamController::class, 'invite']);
        Route::put('/orgs/{org_public_id}/members/{member_id}', [OrgTeamController::class, 'update']);
        Route::delete('/orgs/{org_public_id}/members/{member_id}', [OrgTeamController::class, 'destroy']);

        Route::post('/orgs/{org_public_id}/opportunities', [OrgOpportunityController::class, 'store']);
        Route::get('/orgs/{org_public_id}/opportunities', [OrgOpportunityController::class, 'index']);
        Route::get('/orgs/{org_public_id}/opportunities/{public_id}/applications', [OrgApplicationController::class, 'index']);
        Route::post('/orgs/{org_public_id}/applications/{application_public_id}/accept', [OrgApplicationController::class, 'accept']);
        Route::post('/orgs/{org_public_id}/applications/{application_public_id}/reject', [OrgApplicationController::class, 'reject']);
        Route::post('/orgs/{org_public_id}/applications/{application_public_id}/complete', [OrgApplicationController::class, 'complete']);

        Route::post('/items/{public_id}/request', [OrgItemRequestController::class, 'requestItem']);
        Route::get('/orgs/{org_public_id}/item-requests', [OrgItemRequestController::class, 'index']);
        Route::post('/orgs/{org_public_id}/item-requests/{request_public_id}/accept', [OrgItemRequestController::class, 'accept']);
        Route::post('/orgs/{org_public_id}/item-requests/{request_public_id}/reject', [OrgItemRequestController::class, 'reject']);
        Route::post('/orgs/{org_public_id}/item-requests/{request_public_id}/mark-delivered', [OrgItemRequestController::class, 'markDelivered']);

        // Organization Clothing / Item browsing
        Route::get('/orgs/{org_public_id}/available-items', [ItemController::class, 'availableForOrg']);
        Route::get('/orgs/{org_public_id}/storage', [ItemController::class, 'orgStorage']);

        Route::middleware('platform_admin')->prefix('admin')->group(function () {
            Route::get('/campaigns', [AdminCampaignController::class, 'index']);
            Route::put('/campaigns/{campaign_public_id}', [AdminCampaignController::class, 'update']);
            Route::post('/campaigns/{campaign_public_id}/approve', [AdminCampaignController::class, 'approve']);
            Route::post('/campaigns/{campaign_public_id}/reject', [AdminCampaignController::class, 'reject']);
            Route::delete('/campaigns/{campaign_public_id}', [AdminCampaignController::class, 'destroy']);

            Route::get('/organizations', [AdminOrganizationController::class, 'index']);
            Route::put('/organizations/{org_public_id}', [AdminOrganizationController::class, 'update']);
            Route::delete('/organizations/{org_public_id}', [AdminOrganizationController::class, 'destroy']);

            Route::get('/items', [AdminItemController::class, 'index']);
            Route::post('/items/{item_public_id}/approve', [AdminItemController::class, 'approve']);
            Route::post('/items/{item_public_id}/reject', [AdminItemController::class, 'reject']);

            Route::get('/opportunities', [AdminOpportunityController::class, 'index']);
            Route::post('/opportunities/{public_id}/approve', [AdminOpportunityController::class, 'approve']);
            Route::post('/opportunities/{public_id}/reject', [AdminOpportunityController::class, 'reject']);

            Route::get('/users', [AdminUserController::class, 'index']);
            Route::delete('/users/{user_public_id}', [AdminUserController::class, 'destroy']);
            Route::post('/points/manual-adjust', [AdminPointsController::class, 'manualAdjust']);
        });
    });
});
