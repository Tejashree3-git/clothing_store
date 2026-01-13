<?php
// php_integration/cart_add.php
declare(strict_types=1);
require __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Method not allowed'], 405);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
$productId = $input['productId'] ?? null; $qty = (int)($input['qty'] ?? 1);
if (!$productId || $qty < 1) json_out(['error' => 'productId and qty required'], 400);
$res = api_request('POST', 'cart', ['productId'=>$productId,'qty'=>$qty], true);
json_out($res['ok'] ? $res['data'] : ['error' => $res['data']], $res['ok'] ? 200 : $res['status']);