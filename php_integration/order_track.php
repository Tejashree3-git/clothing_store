<?php
// php_integration/order_track.php
declare(strict_types=1);
require __DIR__ . '/config.php';
$id = $_GET['id'] ?? ''; if (!$id) json_out(['error' => 'Order id required'], 400);
$res = api_request('GET', 'orders/' . urlencode($id) . '/track', [], true);
json_out($res['ok'] ? $res['data'] : ['error' => $res['data']], $res['ok'] ? 200 : $res['status']);