<?php

namespace App\Actions\Select\Sample;

use App\Models\Sample\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemOptions
{
    /**
     * Handle the request to get sample item select options.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function __invoke(Request $request): JsonResponse
    {
        $search = $request->query('search', '');

        $query = Item::query()
            ->select('id', 'string');

        $dbConnection = config('database.default');
        $searchOperator = $dbConnection == 'pgsql' ? 'ilike' : 'like';

        if ($search) {
            $query->where('string', $searchOperator, "%{$search}%");
        }

        $items = $query
            ->orderBy('string')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $items->map(fn($item) => [
                'value' => $item->id,
                'label' => $item->string,
            ]),
        ]);
    }
}
