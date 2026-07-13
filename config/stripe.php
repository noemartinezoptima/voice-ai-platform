<?php

return [

    'prices' => [
        'pro_monthly' => env('STRIPE_PRO_PRICE_ID'),
        'enterprise_monthly' => env('STRIPE_ENTERPRISE_PRICE_ID'),
    ],

];
