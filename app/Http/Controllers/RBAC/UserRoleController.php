<?php

namespace App\Http\Controllers\RBAC;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    /**
     * Display a listing of user-role assignments.
     */
    public function index(Request $request)
    {
        $search = (string)$request->get('search', '');
        $query = User::with(['roles']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('roles', function ($roleQuery) use ($search) {
                      $roleQuery->where('name', 'like', "%{$search}%");
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

        // Transform users with roles into individual user-role records
        $userRoles = [];
        foreach ($users as $user) {
            foreach ($user->roles as $role) {
                $userRoles[] = [
                    'id' => $user->id . '-' . $role->id, // Composite ID
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                    ],
                    'created_at' => $role->pivot->created_at ?? $user->created_at,
                ];
            }
        }

        // Create a paginated response structure for userRoles
        $userRolesPaginated = [
            'data' => $userRoles,
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => count($userRoles),
            'links' => $users->linkCollection()->toArray(),
        ];

        return Inertia::render('rbac/UserRoles/Index', [
            'userRoles' => $userRolesPaginated,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user-role assignment.
     */
    public function create()
    {
        $users = User::all();
        $roles = Role::all();
        
        return Inertia::render('rbac/UserRoles/Create', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user-role assignment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->syncRoles($validated['roles']);

        return redirect()->route('rbac.user-roles.index')
            ->with('success', 'User roles assigned successfully.');
    }

    /**
     * Display the specified user's roles.
     */
    public function show(User $user)
    {
        $user->load('roles');
        
        return Inertia::render('rbac/UserRoles/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing user-role assignments.
     */
    public function edit(User $user)
    {
        $roles = Role::all();
        $user->load('roles');
        
        return Inertia::render('rbac/UserRoles/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update user-role assignments.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->syncRoles($validated['roles'] ?? []);

        return redirect()->route('rbac.user-roles.index')
            ->with('success', 'User roles updated successfully.');
    }

    /**
     * Remove a specific role from a specific user.
     */
    public function destroy($id)
    {
        // Parse the composite ID (format: userId-roleId)
        $parts = explode('-', $id);
        if (count($parts) !== 2) {
            return redirect()->route('rbac.user-roles.index')
                ->with('error', 'Invalid user-role ID format.');
        }

        $userId = $parts[0];
        $roleId = $parts[1];

        $user = User::findOrFail($userId);
        $role = Role::findOrFail($roleId);

        // Remove the specific role from the user
        $user->removeRole($role);

        return redirect()->route('rbac.user-roles.index')
            ->with('success', "Role '{$role->name}' removed from user '{$user->name}' successfully.");
    }
}
