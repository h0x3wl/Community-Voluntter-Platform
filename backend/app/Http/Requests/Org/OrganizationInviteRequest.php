<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationInviteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'role' => ['required', 'in:admin,manager'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
