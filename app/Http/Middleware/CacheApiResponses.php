<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class CacheApiResponses
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  int  $minutes Cache duration in minutes (default: 5)
     * @return mixed
     */
    public function handle(Request $request, Closure $next, int $minutes = 5)
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Create cache key from full URL and query parameters
        $key = 'api_cache:' . md5($request->fullUrl());

        return Cache::remember($key, now()->addMinutes($minutes), function () use ($next, $request) {
            $response = $next($request);
            
            // Only cache successful responses
            if ($response instanceof Response && $response->getStatusCode() === 200) {
                return $response;
            }
            
            // Don't cache error responses
            return $response;
        });
    }
}
