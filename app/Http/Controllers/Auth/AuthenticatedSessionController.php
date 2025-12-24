<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Added Log
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('[Auth] Login Attempt', ['email' => $request->email, 'ip' => $request->ip()]);

        // authenticate() akan throw ValidationException jika gagal
        try {
            $request->authenticate();
            Log::info('[Auth] Login Success', ['email' => $request->email]);
        } catch (\Exception $e) {
            Log::warning('[Auth] Login Failed', ['email' => $request->email, 'error' => $e->getMessage()]);
            throw $e;
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        Log::info('[Auth] Logout', ['user_id' => $user ? $user->id_user : 'unknown', 'email' => $user ? $user->email : 'unknown']);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}