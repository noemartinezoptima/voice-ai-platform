<?php

return [
    'email' => env('ALERT_EMAIL'),
    'rate_limit_minutes' => 60,
    'queue_threshold' => 50,
    'failure_rate_threshold' => 10,
];
