<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log; // Added Log Facade

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        Log::debug('[Email Verification] Processing verification for User ID: ' . $user->id_user . ' (' . $user->email . ')');

        if ($user->hasVerifiedEmail()) {
            Log::info('[Email Verification] User already verified. Redirecting to dashboard.');
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            Log::info('[Email Verification] Success! Marked as verified in DB.');
            event(new Verified($user));
        } else {
            Log::warning('[Email Verification] Failed to mark as verified for some reason.');
        }

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}