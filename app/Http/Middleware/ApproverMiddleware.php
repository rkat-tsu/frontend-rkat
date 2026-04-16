<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ApproverMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Gunakan fungsi yang sudah ada di Model User Anda
        if (!$user || (!$user->isApprover() && !$user->isAdmin())) {
            Log::warning('[Middleware] Akses Ditolak untuk halaman Approval oleh: ' . ($user->username ?? 'Guest'));
            
            // Kembalikan halaman Error 403 via Inertia
            return Inertia::render('Error', [
                'status' => 403,
                'message' => 'Anda tidak memiliki hak akses sebagai Approver untuk halaman ini.'
            ])->toResponse($request)->setStatusCode(403);
        }

        // Jika lolos, lanjutkan request ke Controller
        return $next($request);
    }
}