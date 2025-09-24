<?php

namespace App\Http\Controllers\RBAC;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    /**
     * Display a listing of role-permission assignments.
     */
    public function index(Request $request)
    {
        $search = (string)$request->get('search', '');
        $query = Role::with(['permissions']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('permissions', function ($permissionQuery) use ($search) {
                      $permissionQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['name', 'guard_name', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        $roles = $query->paginate(10)->withQueryString();

        // Transform roles with permissions into individual role-permission records
        $rolePermissions = [];
        foreach ($roles as $role) {
            foreach ($role->permissions as $permission) {
                $rolePermissions[] = [
                    'id' => $role->id . '-' . $permission->id, // Composite ID
                    'role' => [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                    ],
                    'permission' => [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ],
                    'created_at' => $permission->pivot->created_at ?? $role->created_at,
                ];
            }
        }

        // Create a paginated response structure for rolePermissions
        $rolePermissionsPaginated = [
            'data' => $rolePermissions,
            'current_page' => $roles->currentPage(),
            'last_page' => $roles->lastPage(),
            'per_page' => $roles->perPage(),
            'total' => count($rolePermissions),
            'links' => $roles->linkCollection()->toArray(),
        ];

        return Inertia::render('rbac/RolePermissions/Index', [
            'rolePermissions' => $rolePermissionsPaginated,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new role-permission assignment.
     */
    public function create()
    {
        $roles = Role::all();
        $permissions = Permission::all();
        
        return Inertia::render('rbac/RolePermissions/Create', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role-permission assignment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('rbac.role-permissions.index')
            ->with('success', 'Role permissions assigned successfully.');
    }

    /**
     * Display the specified role's permissions.
     */
    public function show(Role $role)
    {
        $role->load('permissions');
        
        return Inertia::render('rbac/RolePermissions/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Show the form for editing role-permission assignments.
     */
    public function edit(Role $role)
    {
        $permissions = Permission::all();
        $role->load('permissions');
        
        return Inertia::render('rbac/RolePermissions/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update role-permission assignments.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('rbac.role-permissions.index')
            ->with('success', 'Role permissions updated successfully.');
    }

    /**
     * Remove a specific permission from a specific role.
     */
    public function destroy($id)
    {
        // Parse the composite ID (format: roleId-permissionId)
        $parts = explode('-', $id);
        if (count($parts) !== 2) {
            return redirect()->route('rbac.role-permissions.index')
                ->with('error', 'Invalid role-permission ID format.');
        }

        $roleId = $parts[0];
        $permissionId = $parts[1];

        $role = Role::findOrFail($roleId);
        $permission = Permission::findOrFail($permissionId);

        // Remove the specific permission from the role
        $role->revokePermissionTo($permission);

        return redirect()->route('rbac.role-permissions.index')
            ->with('success', "Permission '{$permission->name}' removed from role '{$role->name}' successfully.");
    }
}
