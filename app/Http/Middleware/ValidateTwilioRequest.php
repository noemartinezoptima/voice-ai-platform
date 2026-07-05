<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Twilio\Security\RequestValidator;

class ValidateTwilioRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('X-Twilio-Signature');

        if (! $signature) {
            abort(403, 'Missing Twilio signature');
        }

        $validator = new RequestValidator(config('twilio.auth_token'));
        $url = $request->fullUrl();

        if (! $validator->validate($signature, $url, $request->all())) {
            abort(403, 'Invalid Twilio signature');
        }

        return $next($request);
    }
}
