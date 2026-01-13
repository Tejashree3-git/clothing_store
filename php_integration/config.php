<?php
// php_integration/config.php
declare(strict_types=1);
session_start();
const BASE_API = 'http://localhost:5000/api';
function api_request(string $method, string $path, array $payload = [], bool $auth = false): array {
  $url = rtrim(BASE_API, '/') . '/' . ltrim($path, '/');
  $ch = curl_init($url);
  $headers = ['Accept: application/json', 'Content-Type: application/json'];
  if ($auth && !empty($_SESSION['token'])) $headers[] = 'Authorization: Bearer ' . $_SESSION['token'];
  $method = strtoupper($method);
  if ($method === 'GET' && !empty($payload)) curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($payload));
  else curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CUSTOMREQUEST=>$method, CURLOPT_HTTPHEADER=>$headers, CURLOPT_TIMEOUT=>20]);
  $response = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
  if ($response === false) return ['ok'=>false,'status'=>0,'error'=>$err];
  $data = json_decode($response, true);
  return ['ok'=>$status>=200&&$status<300,'status'=>$status,'data'=>$data??$response];
}
function json_out($data, int $status = 200): void { http_response_code($status); header('Content-Type: application/json'); echo json_encode($data, JSON_UNESCAPED_SLASHES); exit; }