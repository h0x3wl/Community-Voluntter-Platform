<?php

namespace App\Http\Requests\Opportunities;

use Illuminate\Foundation\Http\FormRequest;

class OpportunityStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'required_skills' => ['nullable', 'array'],
            'location_type' => ['required', 'in:onsite,remote,hybrid'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'duration_hours' => ['nullable', 'integer', 'min:1'],
            'session_title' => ['nullable', 'string', 'max:255'],
            'session_starts_at' => ['nullable', 'date'],
            'session_timezone' => ['nullable', 'string', 'max:50'],
            'session_join_url' => ['nullable', 'url'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
