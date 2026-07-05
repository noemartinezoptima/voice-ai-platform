<?php

return [
    'account_sid' => env('TWILIO_ACCOUNT_SID'),
    'auth_token' => env('TWILIO_AUTH_TOKEN'),
    'sip_domain' => env('TWILIO_SIP_DOMAIN'),
    'media_worker_url' => env('MEDIA_STREAM_WORKER_URL', 'ws://localhost:9090'),
    'ai_assistant_sid' => env('TWILIO_AI_ASSISTANT_SID'),
];
