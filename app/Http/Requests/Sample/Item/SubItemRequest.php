<?php

namespace App\Http\Requests\Sample\Item;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Embedded SubItem Form Request for Item Show Page
 * 
 * Handles validation for SubItem creation and updates within parent item context
 * This is separate from the standalone SubItem request
 */
class SubItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->route('subItem') !== null;
        
        return [
            // item_id is required for create, optional for update
            'item_id' => [$isUpdate ? 'sometimes' : 'required', 'uuid', 'exists:sample_items,id'],
            
            // Basic fields
            'string' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'integer' => ['nullable', 'integer', 'between:1,100'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'item_id' => 'Parent Item',
            'string' => 'String',
            'email' => 'Email',
            'integer' => 'Integer',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'string.required' => 'The string field is required.',
            'email.email' => 'Please provide a valid email address.',
            'integer.between' => 'The integer must be between 1 and 100.',
        ];
    }
}
