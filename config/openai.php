<?php

return [
    'api_key' => env('OPENAI_API_KEY'),
    'model' => env('OPENAI_MODEL', 'gpt-4o'),
    'timeout' => env('OPENAI_TIMEOUT', 30),
];
