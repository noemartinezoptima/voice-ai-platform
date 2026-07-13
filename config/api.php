<?php

return [
    /*
    | IP Allowlist for API routes. Empty = allow all.
    | Supports single IP, wildcard (192.168.*), CIDR (10.0.0.0/8)
    */
    'ip_allowlist' => array_filter(explode(',', env('API_IP_ALLOWLIST', ''))),

];
