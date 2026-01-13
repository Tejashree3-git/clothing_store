<?php
// php_integration/products.php
declare(strict_types=1);
require __DIR__ . '/config.php';
$q = ['page'=>$_GET['page']??1,'limit'=>$_GET['limit']??20,'category'=>$_GET['category']??'','gender'=>$_GET['gender']??''];
$res = api_request('GET', 'products', $q, false);
json_out($res['ok'] ? $res['data'] : ['error' => $res['data']], $res['ok'] ? 200 : $res['status']);