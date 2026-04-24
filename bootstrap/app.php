<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'approver' => \App\Http\Middleware\ApproverMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, $request) {
            $statusCode = 500;
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                $statusCode = $e->getStatusCode();
            } elseif ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $statusCode = 404;
            } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                $statusCode = 403;
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                return null; // Let Laravel handle validation
            }

            if (in_array($statusCode, [500, 503, 404, 403])) {
                return \Inertia\Inertia::render('Error', [
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
