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
        $storeRules = parent::rules();
        // item_id is optional for update
        $storeRules['item_id'] = ['sometimes', 'uuid', 'exists:sample_items,id'];
        return $storeRules;
    }

}