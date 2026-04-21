<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaderboardIndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'range' => ['nullable', 'string', Rule::in(['weekly', 'monthly', 'all_time'])],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
