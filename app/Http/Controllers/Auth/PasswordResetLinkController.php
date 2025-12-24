<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log; // Added Log
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Log::info('[Forgot Password] Request Link for: ' . $request->email);

        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            Log::info('[Forgot Password] Link sent to: ' . $request->email);
            return back()->with('status', __($status));
        }

        Log::warning('[Forgot Password] Failed to send link: ' . $status);

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}