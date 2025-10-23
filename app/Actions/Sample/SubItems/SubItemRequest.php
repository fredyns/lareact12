<?php

namespace App\Actions\Sample\SubItems;

use App\Enums\Sample\ItemEnumerate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * SubItem Form Request
 * 
 * Handles validation for SubItem creation and updates
 */
class SubItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'item_id' => ['required', 'uuid', 'exists:sample_items,id'],
            'string' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'color' => ['nullable', 'string', 'max:20'],
            'integer' => ['nullable', 'integer', 'between:1,100'],
            'decimal' => ['nullable', 'numeric'],
            'npwp' => ['nullable', 'string', 'max:20', 'regex:/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/'],
            'datetime' => ['nullable', 'date'],
            'date' => ['nullable', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'ip_address' => ['nullable', 'ip'],
            'boolean' => ['nullable', 'boolean'],
            'enumerate' => ['nullable', new Enum(ItemEnumerate::class)],
            'text' => ['nullable', 'string'],
            'file' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'markdown_text' => ['nullable', 'string'],
            'wysiwyg' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'created_by' => ['nullable', 'uuid', 'exists:users,id'],
            'updated_by' => ['nullable', 'uuid', 'exists:users,id'],
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
            'color' => 'Color',
            'integer' => 'Integer',
            'decimal' => 'Decimal',
            'npwp' => 'NPWP',
            'datetime' => 'Datetime',
            'date' => 'Date',
            'time' => 'Time',
            'ip_address' => 'IP Address',
            'boolean' => 'Boolean',
            'enumerate' => 'Enumerate',
            'text' => 'Text',
            'file' => 'File',
            'image' => 'Image',
            'markdown_text' => 'Markdown Text',
            'wysiwyg' => 'WYSIWYG',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'user_id' => 'User',
            'created_by' => 'Created By',
            'updated_by' => 'Updated By',
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
            'npwp.regex' => 'The NPWP format must be 99.999.999.9-999.999',
            'latitude.between' => 'The latitude must be between -90 and 90 degrees',
            'longitude.between' => 'The longitude must be between -180 and 180 degrees',
        ];
    }
}
