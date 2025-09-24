<?php

namespace App\Http\Controllers\RBAC;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class UserPermissionController extends Controller
{
    /**
     * Display a listing of user-permission assignments.
     */
    public function index(Request $request)
    {
        $search = (string)$request->get('search', '');
        $query = User::with(['permissions']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('permissions', function ($permissionQuery) use ($search) {
                      $permissionQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['name', 'email', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        $users = $query->paginate(10)->withQueryString();

        // Transform users with permissions into individual user-permission records
        $userPermissions = [];
        foreach ($users as $user) {
            foreach ($user->permissions as $permission) {
                $userPermissions[] = [
                    'id' => $user->id . '-' . $permission->id, // Composite ID
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'permission' => [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ],
                    'created_at' => $permission->pivot->created_at ?? $user->created_at,
                ];
            }
        }

        // Create a paginated response structure for userPermissions
        $userPermissionsPaginated = [
            'data' => $userPermissions,
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => count($userPermissions),
            'links' => $users->linkCollection()->toArray(),
        ];

        return Inertia::render('rbac/UserPermissions/Index', [
            'userPermissions' => $userPermissionsPaginated,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user-permission assignment.
     */
    public function create()
    {
        $users = User::all();
        $permissions = Permission::all();
        
        return Inertia::render('rbac/UserPermissions/Create', [
            'users' => $users,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created user-permission assignment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->syncPermissions($validated['permissions']);

        return redirect()->route('rbac.user-permissions.index')
            ->with('success', 'User permissions assigned successfully.');
    }

    /**
     * Display the specified user's permissions.
     */
    public function show(User $user)
    {
        $user->load('permissions');
        
        return Inertia::render('rbac/UserPermissions/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing user-permission assignments.
     */
    public function edit(User $user)
    {
        $permissions = Permission::all();
        $user->load('permissions');
        
        return Inertia::render('rbac/UserPermissions/Edit', [
            'user' => $user,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update user-permission assignments.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $user->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('rbac.user-permissions.index')
            ->with('success', 'User permissions updated successfully.');
    }

    /**
     * Remove a specific permission from a specific user.
     */
    public function destroy($id)
    {
        // Parse the composite ID (format: userId-permissionId)
        $parts = explode('-', $id);
        if (count($parts) !== 2) {
            return redirect()->route('rbac.user-permissions.index')
                ->with('error', 'Invalid user-permission ID format.');
        }

        $userId = $parts[0];
        $permissionId = $parts[1];

        $user = User::findOrFail($userId);
        $permission = Permission::findOrFail($permissionId);

        // Remove the specific permission from the user
        $user->revokePermissionTo($permission);

        return redirect()->route('rbac.user-permissions.index')
            ->with('success', "Permission '{$permission->name}' removed from user '{$user->name}' successfully.");
    }
}
