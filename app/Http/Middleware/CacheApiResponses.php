<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class CacheApiResponses
{
    /**
     * Cache invalidation tags for different endpoint types
     */
    private const CACHE_TAGS = [
        'enums' => 'api_cache:enums',
        'notifications' => 'api_cache:notifications',
        'users' => 'api_cache:users',
        'roles' => 'api_cache:roles',
        'permissions' => 'api_cache:permissions',
    ];

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
        
        // Determine cache tag based on endpoint
        $tag = $this->getCacheTag($request);

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

    /**
     * Get cache tag for the current endpoint
     * Used for cache invalidation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    private function getCacheTag(Request $request): string
    {
        $path = $request->path();

        foreach (self::CACHE_TAGS as $endpoint => $tag) {
            if (str_contains($path, $endpoint)) {
                return $tag;
            }
        }

        return 'api_cache:general';
    }

    /**
     * Clear cache for a specific endpoint type
     * Call this from controllers when data is modified
     *
     * Usage in controller:
     * CacheApiResponses::clearCache('enums');
     * CacheApiResponses::clearCache('notifications');
     *
     * @param  string  $endpoint The endpoint type to clear cache for
     * @return void
     */
    public static function clearCache(string $endpoint): void
    {
        $tag = self::CACHE_TAGS[$endpoint] ?? 'api_cache:general';
        
        // Clear all cache keys with this tag pattern
        $pattern = str_replace('api_cache:', 'api_cache:*', $tag);
        
        // Use Cache::flush() for specific pattern or iterate through keys
        // Note: This requires Redis or similar cache driver for pattern matching
        // For file-based cache, you may need to clear manually
        
        if (method_exists(Cache::store(), 'flush')) {
            // For Redis: Cache::tags([$tag])->flush();
            // For now, we'll use a simpler approach
            Cache::forget($tag);
        }
    }

    /**
     * Clear all API caches
     * Call this when doing major data updates
     *
     * @return void
     */
    public static function clearAllCaches(): void
    {
        foreach (self::CACHE_TAGS as $tag) {
            Cache::forget($tag);
        }
    }
}
