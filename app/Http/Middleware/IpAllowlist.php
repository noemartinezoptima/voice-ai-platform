<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IpAllowlist
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowed = config('api.ip_allowlist', []);

        if (empty($allowed)) {
            return $next($request);
        }

        $clientIp = $request->ip();

        foreach ($allowed as $ip) {
            if ($this->ipMatches($clientIp, $ip)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'IP not allowed.'], Response::HTTP_FORBIDDEN);
    }

    private function ipMatches(string $clientIp, string $allowedIp): bool
    {
        if ($clientIp === $allowedIp) {
            return true;
        }

        if (str_contains($allowedIp, '*')) {
            $pattern = '/^'.str_replace(['.', '*'], ['\.', '\d+'], $allowedIp).'$/';

            return (bool) preg_match($pattern, $clientIp);
        }

        if (str_contains($allowedIp, '/')) {
            return $this->ipInCidr($clientIp, $allowedIp);
        }

        return false;
    }

    private function ipInCidr(string $ip, string $cidr): bool
    {
        [$subnet, $bits] = explode('/', $cidr);
        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);

        if ($ipLong === false || $subnetLong === false) {
            return false;
        }

        $mask = -1 << (32 - (int) $bits);

        return ($ipLong & $mask) === ($subnetLong & $mask);
    }
}
