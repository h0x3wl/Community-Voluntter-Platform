<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ManualPointsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_public_id' => ['required', 'string', 'exists:users,public_id'],
            'points' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
