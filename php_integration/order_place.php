<?php
// php_integration/order_place.php
declare(strict_types=1);
require __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Method not allowed'], 405);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
$order = ['shippingAddress'=>$input['shippingAddress'] ?? [], 'paymentInfo'=>$input['paymentInfo'] ?? []];
if (empty($order['shippingAddress'])) json_out(['error' => 'shippingAddress required'], 400);
$res = api_request('POST', 'orders', $order, true);
json_out($res['ok'] ? $res['data'] : ['error' => $res['data']], $res['ok'] ? 201 : $res['status']);