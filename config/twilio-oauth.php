<?php

return [
    'client_id' => env('TWILIO_OAUTH_CLIENT_ID'),
    'client_secret' => env('TWILIO_OAUTH_CLIENT_SECRET'),
    'redirect_url' => env('TWILIO_OAUTH_REDIRECT_URL', '/twilio/oauth/callback'),
    'scopes' => ['account:read', 'call:read', 'call:write', 'sms:read', 'sms:write', 'phone_numbers:write'],
    'authorize_url' => 'https://oauth.twilio.com/v2/authorize',
    'token_url' => 'https://oauth.twilio.com/v2/token',
    'revoke_url' => 'https://oauth.twilio.com/v2/revoke',
];
