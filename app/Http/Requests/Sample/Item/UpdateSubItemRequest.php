<?php

namespace App\Http\Requests\Sample\Item;

class UpdateSubItemRequest extends StoreSubItemRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // item_id is optional for update
            'item_id' => ['sometimes', 'uuid', 'exists:sample_items,id'],

            // Basic fields
            'string' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'integer' => ['nullable', 'integer', 'between:1,100'],
        ];
    }

}