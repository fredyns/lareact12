<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class EnumController extends Controller
{
    /**
     * Get enum cases as select options.
     *
     * @param string $enumClass The enum class name (e.g., 'ItemEnumerate', 'UserRole')
     * @return JsonResponse
     * 
     * @example
     * GET /enums/ItemEnumerate
     * Response: {"data": [{"value": "enable", "label": "Enable"}, {"value": "disable", "label": "Disable"}], "enum": "ItemEnumerate"}
     * 
     * To add a new enum:
     * 1. Add the enum class to the $allowedEnums array below
     * 2. Ensure the enum uses the EnumTrait and has toSelectOptions() method
     * 3. Frontend can fetch via: fetch('/enums/YourEnumName')
     */
    public function show(string $enumClass): JsonResponse
    {
        // Map of allowed enum classes for security
        // Add new enums here to make them available via API
        $allowedEnums = [
            'ItemEnumerate' => \App\Enums\Sample\ItemEnumerate::class,
            'UserRole' => \App\Enums\UserRole::class,
            // Add more enums here as needed
        ];

        // Check if the enum class is allowed
        if (!isset($allowedEnums[$enumClass])) {
            return response()->json([
                'message' => 'Enum class not found or not allowed.',
                'available' => array_keys($allowedEnums),
            ], 404);
        }

        $fullClassName = $allowedEnums[$enumClass];

        // Verify the class exists and has the toSelectOptions method
        if (!class_exists($fullClassName) || !method_exists($fullClassName, 'toSelectOptions')) {
            return response()->json([
                'message' => 'Enum class does not have toSelectOptions method.',
            ], 500);
        }

        try {
            $options = $fullClassName::toSelectOptions();

            return response()->json([
                'data' => $options,
                'enum' => $enumClass,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving enum options.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
