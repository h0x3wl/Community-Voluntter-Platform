<?php

namespace App\Http\Controllers\Api;

use App\Models\ContactMessage;

class ContactController extends ApiController
{
    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        ContactMessage::create($validated);

        return $this->respond(['message' => 'Your message has been received. We will get back to you within 24 hours.']);
    }
}
