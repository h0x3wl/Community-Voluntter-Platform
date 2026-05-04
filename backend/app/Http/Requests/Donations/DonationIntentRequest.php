<?php

namespace App\Http\Requests\Donations;

use Illuminate\Foundation\Http\FormRequest;

class DonationIntentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'amount' => ['nullable', 'numeric', 'min:1', 'required_without:amount_cents'],
            'amount_cents' => ['nullable', 'integer', 'min:100', 'required_without:amount'],
            'currency' => ['required', 'string', 'size:3'],
            'campaign_id' => ['nullable', 'string'],
            'share_slug' => ['nullable', 'string'],
            'anonymous' => ['sometimes', 'boolean'],
            'donor_name' => ['nullable', 'string', 'max:150'],
            'donor_email' => ['nullable', 'email', 'max:255'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function amountCents(): int
    {
        if ($this->filled('amount_cents')) {
            return (int) $this->input('amount_cents');
        }

        return (int) round(((float) $this->input('amount')) * 100);
    }
}
