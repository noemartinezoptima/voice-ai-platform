<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->bearerToken($request);

        if ($token !== null) {
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken !== null && $accessToken->expires_at !== null && $accessToken->expires_at->isPast()) {
                return response()->json(['message' => 'Token expired'], Response::HTTP_UNAUTHORIZED);
            }
        }

        return $next($request);
    }

    private function bearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if ($header === null || ! Str::startsWith($header, 'Bearer ')) {
            return null;
        }

        return Str::after($header, 'Bearer ');
    }
}
