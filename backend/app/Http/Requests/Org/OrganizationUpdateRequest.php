<?php

namespace App\Http\Requests\Org;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $orgId = $this->route('org_public_id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:organizations,slug,' . $orgId . ',public_id'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
