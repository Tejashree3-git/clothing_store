<?php
// php_integration/login.php
declare(strict_types=1);
require __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Method not allowed'], 405);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
$email = $input['email'] ?? ''; $password = $input['password'] ?? '';
if (!$email || !$password) json_out(['error' => 'Email and password required'], 400);
$res = api_request('POST', 'auth/login', ['email'=>$email,'password'=>$password], false);
if (!$res['ok']) json_out(['error' => $res['data'] ?? 'Login failed'], $res['status']);
$_SESSION['token'] = $res['data']['token'] ?? null;
json_out(['token' => $res['data']['token'] ?? null, 'user' => $res['data']['user'] ?? null], 200);