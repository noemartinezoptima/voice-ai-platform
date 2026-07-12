<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SSO Provider
    |--------------------------------------------------------------------------
    |
    | Supported: 'saml', 'oauth', 'oidc'
    |
    */

    'provider' => env('SSO_PROVIDER', 'saml'),

    'saml' => [
        'sp_entity_id' => env('SAML_SP_ENTITY_ID'),
        'sp_acs_url' => env('SAML_SP_ACS_URL'),
        'sp_x509_cert' => env('SAML_SP_X509_CERT'),
        'sp_private_key' => env('SAML_SP_PRIVATE_KEY'),
        'idp_entity_id' => env('SAML_IDP_ENTITY_ID'),
        'idp_sso_url' => env('SAML_IDP_SSO_URL'),
        'idp_x509_cert' => env('SAML_IDP_X509_CERT'),
        'strict' => env('SAML_STRICT', true),
    ],

    'oauth' => [
        'client_id' => env('SSO_OAUTH_CLIENT_ID'),
        'client_secret' => env('SSO_OAUTH_CLIENT_SECRET'),
        'redirect' => env('SSO_OAUTH_REDIRECT'),
        'authorize_url' => env('SSO_OAUTH_AUTHORIZE_URL'),
        'token_url' => env('SSO_OAUTH_TOKEN_URL'),
        'userinfo_url' => env('SSO_OAUTH_USERINFO_URL'),
    ],

];
