<?php

namespace App\Http\Controllers;

use App\Models\RBAC\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

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

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        // Get all roles in the system
        $allRoles = Role::all();

        return Inertia::render('Users/Show', [
            'user' => $user->only(['id', 'name', 'email', 'email_verified_at', 'created_at', 'updated_at']),
            'userRoles' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
            'allRoles' => $allRoles->map(function ($role) use ($user) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'assigned' => $user->hasRole($role),
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $this->authorize('update', $user);

        return Inertia::render('Users/Edit', [
            'user' => $user->only(['id', 'name', 'email', 'email_verified_at']),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Add a role to the specified user.
     */
    public function addRole(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findById($validated['role_id']);

        if (!$user->hasRole($role)) {
            $user->assignRole($role);
            return back()->with('success', "Role '{$role->name}' assigned successfully.");
        }

        return back()->with('info', "User already has the role '{$role->name}'.");
    }

    /**
     * Remove a role from the specified user.
     */
    public function removeRole(User $user, $roleId)
    {
        $this->authorize('update', $user);

        $role = Role::findById($roleId);

        if ($user->hasRole($role)) {
            $user->removeRole($role);
            return back()->with('success', "Role '{$role->name}' removed successfully.");
        }

        return back()->with('info', "User doesn't have the role '{$role->name}'.");
    }
}
