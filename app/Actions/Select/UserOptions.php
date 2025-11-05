<?php

namespace App\Actions\Select;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserOptions
{
    /**
     * Handle the request to get user select options.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function __invoke(Request $request): JsonResponse
    {
        $search = $request->query('search', '');

        $query = User::query()
            ->select('id', 'name', 'email');

        $dbConnection = config('database.default');
        $searchOperator = $dbConnection == 'pgsql' ? 'ilike' : 'like';

        if ($search) {
            $query->where(function ($q) use ($search, $searchOperator) {
                $q->where('name', $searchOperator, "%{$search}%")
                    ->orWhere('email', $searchOperator, "%{$search}%");
            });
        }

        $users = $query
            ->orderBy('name')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $users->map(fn($user) => [
                'value' => $user->id,
                'label' => "{$user->name} ({$user->email})",
            ]),
        ]);
    }
}
