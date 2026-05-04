<?php

namespace App\Http\Requests\Me;

use Illuminate\Foundation\Http\FormRequest;

class NotificationPreferencesRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email_notifications' => ['required', 'boolean'],
            'sms_alerts' => ['required', 'boolean'],
            'push_notifications' => ['required', 'boolean'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
