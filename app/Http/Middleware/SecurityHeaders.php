<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (method_exists($response, 'headers')) {
            // Strict-Transport-Security (HSTS)
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            // Content-Security-Policy (CSP)
            $response->headers->set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://fonts.bunny.net https://fonts.gstatic.com");
            
            // Extra security headers
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
        }

        return $response;
    }
}
