<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PlatformAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'platform_admin') {
            return response()->json(['message' => 'Forbidden. Platform admin access required.'], 403);
        }

        return $next($request);
    }
}
