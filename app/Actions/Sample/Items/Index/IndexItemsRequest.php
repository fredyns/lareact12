<?php

namespace App\Actions\Sample\Items\Index;

use App\Enums\Sample\ItemEnumerate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Index Items Request
 *
 * Handles validation for filtering and sorting items in the index view.
 * All filter parameters, sorting options, and pagination settings are validated
 * before being executed in the query.
 *
 * @property string|null $search Search query string (max 255 characters)
 * @property string|null $user_id UUID of the user to filter by
 * @property string|null $enumerate Enumerate value to filter by
 * @property array|null $columns Array of columns to display
 * @property string|null $sort_field Field to sort by (string, email, integer, decimal, datetime, date, created_at, updated_at)
 * @property string|null $sort_direction Sort direction (asc or desc)
 * @property int|null $page Current page number (min 1)
 * @property int|null $per_page Items per page (min 10, max 100, must be multiple of 10)
 *
 */
class IndexItemsRequest extends FormRequest
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
            // Search
            'search' => ['nullable', 'string', 'max:255'],

            // Filters
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'enumerate' => ['nullable', new Enum(ItemEnumerate::class)],

            // Columns
            'columns' => ['nullable', 'array'],
            'columns.*' => [
                'nullable',
                'string',
                Rule::in([
                    'user_id',
                    'string',
                    'email',
                    'color',
                    'integer',
                    'decimal',
                    'npwp',
                    'datetime',
                    'date',
                    'time',
                    'ip_address',
                    'boolean',
                    'enumerate',
                    'file',
                    'image',
                ]),
            ],

            // Sorting
            'sort_field' => [
                'nullable',
                'string',
                Rule::in([
                    'string',
                    'email',
                    'integer',
                    'decimal',
                    'datetime',
                    'date',
                    'created_at',
                    'updated_at',
                ]),
            ],
            'sort_direction' => [
                'nullable',
                'string',
                Rule::in(['asc', 'desc']),
            ],

            // Pagination
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => [
                'nullable',
                'integer',
                'min:10',
                'max:100',
                function ($attribute, $value, $fail) {
                    if ($value % 10 !== 0) {
                        $fail('The ' . $attribute . ' must be a multiple of 10.');
                    }
                },
            ],
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
            'search' => 'Search',
            'user_id' => 'User',
            'enumerate' => 'Enumerate',
            'sort_field' => 'Sort Field',
            'sort_direction' => 'Sort Direction',
            'page' => 'Page',
            'per_page' => 'Items Per Page',
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
            'sort_field.in' => 'The selected sort field is invalid. Allowed fields: string, email, integer, decimal, datetime, date, created_at, updated_at.',
            'sort_direction.in' => 'The sort direction must be either asc or desc.',
            'per_page.min' => 'You must display at least 10 items per page.',
            'per_page.max' => 'You cannot display more than 100 items per page.',
        ];
    }

    /**
     * Get validated search query
     */
    public function getSearch(): string
    {
        return (string)$this->validated('search', '');
    }

    /**
     * Get validated sort field with default
     */
    public function getSortField(): string
    {
        return $this->validated('sort_field', 'created_at');
    }

    /**
     * Get validated sort direction with default
     */
    public function getSortDirection(): string
    {
        return $this->validated('sort_direction', 'desc');
    }

    /**
     * Get validated per page with default
     */
    public function getPerPage(): int
    {
        return (int)$this->validated('per_page', 10);
    }

    /**
     * Get validated columns with defaults
     */
    public function getColumns($defaultDisplayColumns): array
    {
        $columns = $this->validated('columns', $defaultDisplayColumns);

        return array_unique($columns);
    }
}
