<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\ApproverMiddleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'approver' => ApproverMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, $request) {
            $statusCode = 500;
            if ($e instanceof HttpExceptionInterface) {
                $statusCode = $e->getStatusCode();
            } elseif ($e instanceof ModelNotFoundException) {
                $statusCode = 404;
            } elseif ($e instanceof AuthorizationException) {
                $statusCode = 403;
            } elseif ($e instanceof AuthenticationException) {
                return null; // Biarkan Laravel handle (redirect ke login)
            } elseif ($e instanceof ValidationException) {
                return null; // Let Laravel handle validation
            }

            if (in_array($statusCode, [500, 503, 404, 403, 405])) {
                return Inertia::render('Error', [
                    'status' => $statusCode,
                    'message' => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan internal server.',
                ])->toResponse($request)->setStatusCode($statusCode);
            }

            if ($statusCode === 419) {
                return back()->with([
                    'error' => 'Halaman telah kadaluarsa (Session Expired), silakan coba lagi.',
                ]);
            }

            return null;
        });
    })->create();
