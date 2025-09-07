<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'tmdb' => [
        'key' => env('TMDB_API_KEY'),
        'lang' => env('TMDB_LANG', 'en-US'),
        'image_base' => env('TMDB_IMAGE_BASE', 'https://image.tmdb.org/t/p'),
    ],

    'smashy' => [
        'base_url' => env('SMASHY_BASE_URL'),
        'api_key'  => env('SMASHY_API_KEY'),
        'timeout'  => env('SMASHY_TIMEOUT', 15),
    ],

    'providers' => [
        'api_url' => env('PROVIDERS_API_URL', 'http://localhost:3001'),
        'timeout' => env('PROVIDERS_TIMEOUT', 30),
    ],

    'servers_resolver' => [
        'api_url' => env('SERVERS_RESOLVER_URL', 'http://localhost:3002'),
        'timeout' => env('SERVERS_RESOLVER_TIMEOUT', 20),
    ],

];
