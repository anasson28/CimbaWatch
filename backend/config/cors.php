<?php

return [

 'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    env('FRONTEND_ORIGIN', 'http://localhost:3000'),
    env('FRONTEND_ORIGIN_2', 'http://127.0.0.1:3000'),
],
'allowed_headers' => ['*'],
'supports_credentials' => false,

];
