<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        Log::debug('[Verifikasi Email] Memproses verifikasi untuk User ID: ' . $user->id_user . ' (' . $user->email . ')');

        if ($user->hasVerifiedEmail()) {
            Log::info('[Verifikasi Email] User sudah terverifikasi. Mengalihkan ke dashboard.');
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            Log::info('[Verifikasi Email] Berhasil! Ditandai sebagai terverifikasi di DB.');
            event(new Verified($user));
        } else {
            Log::warning('[Verifikasi Email] Gagal menandai sebagai terverifikasi karena alasan tertentu.');
        }

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}