<?php
// php_integration/cart_get.php
declare(strict_types=1);
require __DIR__ . '/config.php';
$res = api_request('GET', 'cart', [], true);
json_out($res['ok'] ? $res['data'] : ['error' => $res['data']], $res['ok'] ? 200 : $res['status']);