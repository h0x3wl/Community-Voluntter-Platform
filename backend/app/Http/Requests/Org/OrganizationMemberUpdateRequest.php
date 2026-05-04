<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationMemberUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'role' => ['required', 'in:admin,manager'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
