<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationMemberUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'role' => ['required', 'in:admin,editor,viewer'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
