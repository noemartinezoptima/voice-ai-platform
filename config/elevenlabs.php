<?php

return [
    'api_key' => env('ELEVENLABS_API_KEY'),
    'default_voice_id' => env('ELEVENLABS_DEFAULT_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'),
    'model' => env('ELEVENLABS_MODEL', 'eleven_turbo_v2_5'),
    'agent_id' => env('ELEVENLABS_AGENT_ID'),
];
