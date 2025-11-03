<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        // Cache the login page response for 1 hour (unless user is authenticated)
        // This reduces server load for repeated page views
        if (!auth()->check()) {
            return Inertia::render('auth/login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => $request->session()->get('status'),
            ])->withHeaders([
                'Cache-Control' => 'public, max-age=3600, s-maxage=3600',
                'Vary' => 'Accept-Encoding',
            ]);
        }

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Validate credentials (optimized with direct query and minimal columns)
        $user = $request->validateCredentials();

        // Check two-factor authentication (only if enabled)
        if (Features::enabled(Features::twoFactorAuthentication()) && $user->two_factor_enabled) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        // Login user with remember token if requested
        $rememberMe = $request->boolean('remember');
        Auth::login($user, $rememberMe);

        // Regenerate session for security
        $request->session()->regenerate();

        // Redirect to intended page or dashboard
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
