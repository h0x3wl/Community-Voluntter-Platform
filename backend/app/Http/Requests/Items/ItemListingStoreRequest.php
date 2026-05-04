<?php

namespace App\Http\Requests\Items;

use Illuminate\Foundation\Http\FormRequest;

class ItemListingStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'condition' => ['required', 'in:new,like_new,good,fair,poor'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'ai_category' => ['nullable', 'string', 'max:100'],
            'ai_confidence' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'target_organization_id' => ['nullable', 'string', 'exists:organizations,public_id'],
            'image' => ['nullable', 'image', 'max:10240'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
