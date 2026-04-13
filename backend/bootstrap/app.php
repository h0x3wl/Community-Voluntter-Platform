<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'platform_admin' => \App\Http\Middleware\PlatformAdminMiddleware::class,
        ]);

        $headers = defined(Request::class.'::HEADER_X_FORWARDED_ALL')
            ? Request::HEADER_X_FORWARDED_ALL
            : Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO;

        $middleware->trustProxies(at: '*', headers: $headers);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->expectsJson() && ! $request->is('api/*')) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                return response()->json([
                    'data' => [
                        'message' => 'Validation failed.',
                        'errors' => $exception->errors(),
                    ],
                    'meta' => (object) [],
                ], $exception->status);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'data' => ['message' => 'Unauthenticated.'],
                    'meta' => (object) [],
                ], 401);
            }

            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'data' => ['message' => 'Forbidden.'],
                    'meta' => (object) [],
                ], 403);
            }

            if ($exception instanceof ModelNotFoundException) {
                return response()->json([
                    'data' => ['message' => 'Resource not found.'],
                    'meta' => (object) [],
                ], 404);
            }

            if ($exception instanceof HttpExceptionInterface) {
                $message = $exception->getMessage() ?: 'Request failed.';

                return response()->json([
                    'data' => ['message' => $message],
                    'meta' => (object) [],
                ], $exception->getStatusCode());
            }

            return response()->json([
                'data' => ['message' => 'Server error.'],
                'meta' => (object) [],
            ], 500);
        });
    })->create();
