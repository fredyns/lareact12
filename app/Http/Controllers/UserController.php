<?php

namespace App\Http\Controllers;

use App\Actions\Users\AssignRoleToUser;
use App\Actions\Users\DeleteUser;
use App\Actions\Users\IndexUsers;
use App\Actions\Users\RemoveRoleFromUser;
use App\Actions\Users\StoreUser;
use App\Actions\Users\UpdateUser;
use App\Http\Resources\UserResourceCollection;
use App\Models\RBAC\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        protected IndexUsers $indexUsers,
        protected StoreUser $storeUser,
        protected UpdateUser $updateUser,
        protected DeleteUser $deleteUser,
        protected AssignRoleToUser $assignRoleToUser,
        protected RemoveRoleFromUser $removeRoleFromUser
    ) {
        // Authorization is handled in individual methods
    }
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = $this->indexUsers->handle($request);

        // Return API response if requested
        if ($request->wantsJson()) {
            return new UserResourceCollection($users);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        return Inertia::render('users/index', [
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

        return Inertia::render('users/create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $user = $this->storeUser->handle($request);

        // Return JSON for AJAX requests (e.g., from InputSelectUser component)
        if ($request->wantsJson()) {
            return response()->json([
                'data' => $user->only(['id', 'name', 'email']),
                'message' => 'User created successfully.',
            ], 201);
        }

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

        return Inertia::render('users/show', [
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

        return Inertia::render('users/edit', [
            'user' => $user->only(['id', 'name', 'email', 'email_verified_at']),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $user = $this->updateUser->handle($request, $user);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $this->deleteUser->handle($user);

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Add a role to the specified user.
     */
    public function addRole(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $result = $this->assignRoleToUser->handle($request, $user);

        return back()->with(
            $result['success'] ? 'success' : 'info',
            $result['message']
        );
    }

    /**
     * Remove a role from the specified user.
     */
    public function removeRole(User $user, $roleId)
    {
        $this->authorize('update', $user);

        $result = $this->removeRoleFromUser->handle($user, $roleId);

        return back()->with(
            $result['success'] ? 'success' : 'info',
            $result['message']
        );
    }
}
