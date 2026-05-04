<?php

namespace App\Http\Requests\Items;

use Illuminate\Foundation\Http\FormRequest;

class ItemRequestStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'organization_public_id' => ['nullable', 'string', 'exists:organizations,public_id', 'required_without:organization_id'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id', 'required_without:organization_public_id'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
