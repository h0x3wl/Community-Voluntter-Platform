<?php

namespace App\Http\Controllers\Api;

use App\Models\NewsletterSubscriber;

class NewsletterController extends ApiController
{
    public function subscribe(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $subscriber = NewsletterSubscriber::firstOrCreate(
            ['email' => $request->input('email')],
            ['subscribed_at' => now()]
        );

        if ($subscriber->wasRecentlyCreated) {
            return $this->respond(['message' => 'Thanks for subscribing! You will receive updates on our latest campaigns.']);
        }

        return $this->respond(['message' => 'You are already subscribed. Thank you for your continued support!']);
    }
}
