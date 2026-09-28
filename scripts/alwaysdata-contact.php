<?php
declare(strict_types=1);

$allowedOrigins = [
    'https://pola5h.github.io',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (str_contains($contentType, 'application/json')) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?? [];
} else {
    $input = $_POST;
}

// Honeypot spam filter
if (!empty($input['website']) || !empty($input['_gotcha'])) {
    echo json_encode(['success' => true, 'message' => 'Message received.']);
    exit;
}

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$timestamp = date('Y-m-d H:i:s');
$storageDir = dirname(__DIR__, 2) . '/storage';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}

try {
    $pdo = new PDO("sqlite:{$storageDir}/leads.sqlite");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip TEXT NOT NULL,
            attempt_time INTEGER NOT NULL
        )
    ");

    $tenMinutesAgo = time() - 600;
    $pdo->prepare("DELETE FROM rate_limits WHERE attempt_time < :t")->execute([':t' => $tenMinutesAgo]);

    $rateCheck = $pdo->prepare("SELECT COUNT(*) FROM rate_limits WHERE ip = :ip AND attempt_time >= :t");
    $rateCheck->execute([':ip' => $ip, ':t' => $tenMinutesAgo]);
    $attempts = (int)$rateCheck->fetchColumn();

    if ($attempts >= 6) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Too many requests. Please wait a few minutes before trying again or email directly.'
        ]);
        exit;
    }

    $pdo->prepare("INSERT INTO rate_limits (ip, attempt_time) VALUES (:ip, :t)")->execute([':ip' => $ip, ':t' => time()]);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            scope TEXT,
            message TEXT NOT NULL,
            ip TEXT,
            user_agent TEXT,
            created_at DATETIME
        )
    ");

    try {
        $pdo->exec("ALTER TABLE leads ADD COLUMN phone TEXT");
    } catch (\Throwable $ignored) {}
} catch (\Throwable $e) {
    error_log("SQLite Init Error: " . $e->getMessage());
}

$name    = trim(strip_tags((string)($input['name'] ?? '')));
$email   = filter_var(trim((string)($input['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$phone   = trim(strip_tags((string)($input['phone'] ?? '')));
$scope   = trim(strip_tags((string)($input['scope'] ?? 'General Inquiry')));
$message = trim(strip_tags((string)($input['message'] ?? '')));

if (empty($name) || !$email || empty($phone) || empty($message)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your name, valid email address, phone number, and project details.'
    ]);
    exit;
}

try {
    if (isset($pdo)) {
        $stmt = $pdo->prepare("
            INSERT INTO leads (name, email, phone, scope, message, ip, user_agent, created_at)
            VALUES (:name, :email, :phone, :scope, :message, :ip, :user_agent, :created_at)
        ");
        $stmt->execute([
            ':name'       => $name,
            ':email'      => $email,
            ':phone'      => $phone,
            ':scope'      => $scope,
            ':message'    => $message,
            ':ip'         => $ip,
            ':user_agent' => $userAgent,
            ':created_at' => $timestamp
        ]);
    }
} catch (\Throwable $e) {
    error_log("SQLite Insert Error: " . $e->getMessage());
}

$cleanPhone = preg_replace('/[^0-9]/', '', $phone);
$whatsappUrl = "https://wa.me/{$cleanPhone}";

$toRecipient = 'kzaman3055@gmail.com';
$emailSubject = "🚀 New Lead: {$name} — {$scope}";

$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safeScope = htmlspecialchars($scope, ENT_QUOTES, 'UTF-8');

$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
<div style="max-width:580px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
  <!-- Header -->
  <div style="background-color:#ffffff;padding:24px 28px 20px;border-bottom:1px solid #e2e8f0;border-top:4px solid #4f46e5;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#4f46e5;margin-bottom:6px;">Polash Architecture · Lead Alert</div>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;line-height:1.3;">🚀 New Project Brief Received</h1>
  </div>
  <!-- Body -->
  <div style="padding:28px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:10px;">Client Information</div>
    <table style="width:100%;border-collapse:collapse;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:22px;font-size:14px;">
      <tr><td style="padding:11px 16px;color:#64748b;border-bottom:1px solid #e2e8f0;width:35%;">Name</td><td style="padding:11px 16px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">{$safeName}</td></tr>
      <tr><td style="padding:11px 16px;color:#64748b;border-bottom:1px solid #e2e8f0;">Email</td><td style="padding:11px 16px;font-weight:600;color:#4f46e5;border-bottom:1px solid #e2e8f0;"><a href="mailto:{$safeEmail}" style="color:#4f46e5;text-decoration:none;">{$safeEmail}</a></td></tr>
      <tr><td style="padding:11px 16px;color:#64748b;border-bottom:1px solid #e2e8f0;">Phone / WhatsApp</td><td style="padding:11px 16px;font-weight:600;color:#059669;border-bottom:1px solid #e2e8f0;"><a href="tel:{$safePhone}" style="color:#059669;text-decoration:none;">{$safePhone}</a></td></tr>
      <tr><td style="padding:11px 16px;color:#64748b;border-bottom:1px solid #e2e8f0;">Project Scope</td><td style="padding:11px 16px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;"><span style="display:inline-block;background-color:#e0e7ff;color:#3730a3;padding:3px 8px;border-radius:4px;font-size:12px;">{$safeScope}</span></td></tr>
      <tr><td style="padding:11px 16px;color:#64748b;">Received</td><td style="padding:11px 16px;color:#64748b;font-size:12px;">{$timestamp} · IP: {$ip}</td></tr>
    </table>

    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin-bottom:10px;">Project Requirements &amp; Message</div>
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #4f46e5;border-radius:6px;padding:16px 18px;font-size:14px;line-height:1.65;color:#334155;margin-bottom:24px;">
      {$safeMessage}
    </div>

    <div style="text-align:center;padding-top:16px;border-top:1px solid #e2e8f0;">
      <a href="mailto:{$safeEmail}?subject=Re:%20{$safeScope}%20—%20Kamruzzaman%20Polash" style="display:inline-block;padding:12px 22px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin:4px;">✉️ Reply via Email</a>
      <a href="{$whatsappUrl}" target="_blank" style="display:inline-block;padding:12px 22px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin:4px;">💬 Chat on WhatsApp</a>
    </div>
  </div>
  <!-- Footer -->
  <div style="padding:14px 20px;background-color:#f8fafc;font-size:12px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;">
    Sent securely from Kamruzzaman Polash's Portfolio
  </div>
</div>
</body>
</html>
HTML;

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Portfolio Engine <no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'alwaysdata.net') . '>',
    'Reply-To: ' . "{$name} <{$email}>",
    'X-Mailer: PHP/' . phpversion()
];

@mail($toRecipient, $emailSubject, $htmlBody, implode("\r\n", $headers));

echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your project brief has been received. I will respond within 4 hours.'
]);
