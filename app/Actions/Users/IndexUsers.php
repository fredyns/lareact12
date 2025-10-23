<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Index Users Action
 *
 * Handles listing and filtering of users
 */
class IndexUsers
{
    /**
     * Get paginated and filtered users
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function handle(Request $request): LengthAwarePaginator
    {
        // Search functionality and build query
        $search = (string)$request->get('search', '');
        $query = User::search($search);

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['name', 'email', 'created_at', 'email_verified_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(10)->withQueryString();
    }
}
