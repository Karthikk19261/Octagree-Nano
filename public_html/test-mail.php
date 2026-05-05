<?php
/**
 * test-mail.php — one-shot mail() diagnostic page.
 *
 * Drop this file in your web root once, open it in a browser, click "Send Test",
 * watch what happens. Then DELETE this file (or move it out of public_html).
 *
 * It will:
 *   1. Show your PHP / sendmail / server config
 *   2. Try a minimal mail() call to your inbox
 *   3. Try the same call through your real sendgrid_engine.php (the one your
 *      contact / quote / feedback forms use), to all three production recipients
 *   4. Show every error message, line by line
 *   5. Tell you exactly what to fix next
 *
 * SECURITY:
 *   - Anyone with the URL can use this to bounce mail through your server.
 *     A simple time-based rate limit (3 calls / 5 minutes per IP) is in place.
 *   - DELETE THIS FILE after you've confirmed mail() works. Don't leave it live.
 */

// =====================================================================
// Rate limit (file-based, per IP) — 3 sends per 5 minutes
// =====================================================================
$rateFile = __DIR__ . '/.test-mail-ratelimit.json';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();
$state = [];
if (is_file($rateFile)) {
    $raw = @file_get_contents($rateFile);
    if ($raw) $state = json_decode($raw, true) ?: [];
}
$state[$ip] = array_filter($state[$ip] ?? [], fn($t) => $t > $now - 300);
$rateBlocked = (count($state[$ip]) >= 3);

// =====================================================================
// Run a test if this is a POST submission
// =====================================================================
$results = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$rateBlocked) {
    $target = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    if ($target) {
        // record this attempt for the rate limit
        $state[$ip][] = $now;
        @file_put_contents($rateFile, json_encode($state), LOCK_EX);

        $results = [
            'target'  => $target,
            'attempts' => [],
        ];

        // -------- Test A: minimal mail() with no fancy headers ---------
        $simpleSubject = 'Octagreen test (simple) ' . date('H:i:s');
        $simpleBody    = "If you are reading this, PHP mail() works on your host.\nTime: " . date('c') . "\nFrom IP: " . $ip;
        $simpleHeaders = "From: noreply@octagreennano.com\r\nReply-To: noreply@octagreennano.com\r\n";
        @error_clear_last();
        $okA = @mail($target, $simpleSubject, $simpleBody, $simpleHeaders);
        $results['attempts'][] = [
            'label'   => 'A. Minimal mail() — plain text, simplest possible',
            'to'      => $target,
            'ok'      => $okA,
            'lastErr' => error_get_last(),
        ];

        // -------- Test B: through your real engine (HTML, multi-recipient) ---------
        if (is_file(__DIR__ . '/sendgrid_engine.php')) {
            include_once 'sendgrid_engine.php';
            $htmlBody = '<h2>Octagreen mail engine test</h2>'
                . '<p>This goes through your actual <code>sendemail()</code> function — same code path as the contact / quote / feedback forms.</p>'
                . '<p>Time: ' . date('c') . '<br>From IP: ' . htmlspecialchars($ip) . '</p>';
            foreach ([$target, 'prathish@octagreennano.com', 'mail@octagreennano.com'] as $rcpt) {
                @error_clear_last();
                $ok = sendemail($rcpt, 'Octagreen engine test ' . date('H:i:s'), $htmlBody);
                $results['attempts'][] = [
                    'label'   => "B. Engine sendemail() → {$rcpt}",
                    'to'      => $rcpt,
                    'ok'      => (bool)$ok,
                    'lastErr' => error_get_last(),
                ];
            }
        } else {
            $results['attempts'][] = [
                'label'   => 'B. (sendgrid_engine.php not found — skipped engine test)',
                'to'      => '—',
                'ok'      => null,
                'lastErr' => null,
            ];
        }
    }
}

// =====================================================================
// Diagnostic info (always shown)
// =====================================================================
$diag = [
    'PHP version'        => PHP_VERSION,
    'OS'                 => PHP_OS,
    'Server software'    => $_SERVER['SERVER_SOFTWARE'] ?? '?',
    'Server name'        => $_SERVER['SERVER_NAME'] ?? '?',
    'sendmail_path'      => ini_get('sendmail_path') ?: '(not set — usually means PHP will use its default sendmail binary)',
    'SMTP'               => ini_get('SMTP') ?: '(not set)',
    'smtp_port'          => ini_get('smtp_port') ?: '(not set)',
    'mail.add_x_header'  => ini_get('mail.add_x_header') ?: '(not set)',
    'mail.log'           => ini_get('mail.log') ?: '(not set)',
    'mail() function'    => function_exists('mail') ? 'available' : 'NOT AVAILABLE — host disabled it',
    'curl available'     => function_exists('curl_init') ? 'yes' : 'no',
    'Your IP'            => $ip,
    'mail-failures.log'  => is_file(__DIR__ . '/mail-failures.log')
        ? 'exists (' . filesize(__DIR__ . '/mail-failures.log') . ' bytes — failed sends will be logged here)'
        : 'not yet created (will be created on first failure)',
];
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Octagreen mail() test</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.55; }
  h1 { color: #2D8E5F; margin-bottom: .25rem; }
  .warn { background: #fff8e0; border: 2px solid #f4c430; padding: 1rem 1.25rem; border-radius: 8px; margin: 1rem 0 2rem; }
  .warn strong { color: #b46b00; }
  form { background: #f4faf6; border: 1px solid #cfe5d9; padding: 1.25rem; border-radius: 8px; }
  label { display: block; font-weight: 600; margin: .25rem 0; }
  input[type=email] { width: 100%; padding: .65rem; font-size: 1rem; border: 1.5px solid #cfe5d9; border-radius: 6px; margin: .25rem 0 .75rem; }
  button { background: #2D8E5F; color: #fff; border: 0; padding: .8rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; }
  button:hover { background: #1F6B45; }
  .result { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; }
  .result.ok { background: #ecfdf5; border: 1px solid #a7f3d0; }
  .result.fail { background: #fef2f2; border: 1px solid #fecaca; }
  .attempt { padding: .65rem .85rem; border-radius: 6px; margin: .5rem 0; font-family: ui-monospace, Consolas, monospace; font-size: .9rem; }
  .attempt.ok { background: #d1fae5; }
  .attempt.fail { background: #fee2e2; }
  .attempt.skip { background: #f1f5f9; color: #64748b; }
  table.diag { border-collapse: collapse; width: 100%; font-size: .9rem; margin: 1rem 0; }
  table.diag td { border-bottom: 1px solid #eef0ee; padding: .45rem .65rem; vertical-align: top; }
  table.diag td:first-child { font-weight: 600; width: 200px; color: #555; }
  .next { background: #eef6ff; border: 1px solid #bedcfb; padding: 1rem 1.25rem; border-radius: 8px; margin: 1.25rem 0; }
  .next h3 { margin-top: 0; }
  code { background: #f4faf6; padding: 1px 5px; border-radius: 3px; font-size: .9em; }
  small { color: #666; }
</style>
</head>
<body>

<h1>Octagreen <code>mail()</code> diagnostic</h1>
<p>One-shot test page. Use it once, confirm mail works, then <strong>delete this file from your web root</strong>.</p>

<div class="warn">
  <strong>⚠ Delete this file after testing.</strong> If left live, anyone with the URL can use your server to bounce small amounts of email (rate-limited to 3 / 5 min per IP, but still: <strong>delete it</strong>).
  Path on disk: <code><?= htmlspecialchars(__FILE__) ?></code>
</div>

<?php if ($rateBlocked): ?>
  <div class="result fail">
    <strong>Rate limit hit.</strong> You've already submitted 3 tests in the last 5 minutes from this IP. Wait a few minutes or just delete this file — your tests are done.
  </div>
<?php else: ?>
  <form method="post">
    <label for="email">Send a test email to:</label>
    <input type="email" name="email" id="email" placeholder="you@gmail.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
    <button type="submit">Send Test</button>
    <p><small>Use a Gmail or Yahoo address you can check immediately. The test sends one plain-text email + three HTML emails through your real engine. <strong>Check spam too</strong> — first sends from a new domain often land there.</small></p>
  </form>
<?php endif; ?>

<?php if ($results): ?>
  <h2 style="margin-top:2rem">Results</h2>
  <p>Target inbox: <code><?= htmlspecialchars($results['target']) ?></code></p>
  <?php
  $allOk = true;
  foreach ($results['attempts'] as $a) {
      if ($a['ok'] === false) $allOk = false;
  }
  $cls = $allOk ? 'ok' : 'fail';
  ?>
  <div class="result <?= $cls ?>">
    <strong><?= $allOk ? '✓ All mail() calls returned true.' : '✗ At least one mail() call returned false.' ?></strong><br>
    <small><?= $allOk
      ? 'Now check the inbox(es). Email may take 1–5 minutes. If nothing arrives within 10 minutes, check the Spam folder. Still nothing → SPF/DKIM not configured at your DNS. Tell Karthik (or me) and we will add the records.'
      : 'mail() returned false on at least one call. See per-attempt details below — the error message will tell us exactly what to fix.' ?></small>
  </div>

  <?php foreach ($results['attempts'] as $a): ?>
    <?php $aCls = $a['ok'] === true ? 'ok' : ($a['ok'] === false ? 'fail' : 'skip'); ?>
    <div class="attempt <?= $aCls ?>">
      <?= $a['ok'] === true ? '✓' : ($a['ok'] === false ? '✗' : '·') ?>
      <strong><?= htmlspecialchars($a['label']) ?></strong>
      → <?= htmlspecialchars((string)$a['to']) ?>
      <?php if ($a['lastErr']): ?>
        <br><small style="color:#991b1b">last PHP error: <?= htmlspecialchars($a['lastErr']['message'] ?? '') ?></small>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<h2>Server diagnostics</h2>
<table class="diag">
  <?php foreach ($diag as $k => $v): ?>
    <tr><td><?= htmlspecialchars($k) ?></td><td><?= htmlspecialchars((string)$v) ?></td></tr>
  <?php endforeach; ?>
</table>

<div class="next">
  <h3>What to do next</h3>
  <ul>
    <li><strong>If mail arrived</strong> — your forms will work. Delete this file.</li>
    <li><strong>If mail() returned <code>true</code> but nothing arrived</strong> — host accepted the mail but it landed in Gmail/Yahoo spam. The fix is at your domain registrar (DNS): add an SPF TXT record like <code>v=spf1 a mx ~all</code> on octagreennano.com. Optional but better: a DKIM record from your host. Tell us your host (cPanel? Hostinger? GoDaddy?) and we'll guide you through.</li>
    <li><strong>If mail() returned <code>false</code></strong> — your host has disabled or misconfigured PHP mail. Open a support ticket: <em>"Please enable the mail() function and configure outbound SMTP for my account."</em> If they refuse (some shared hosts do for spam reasons), the alternative is to wire PHPMailer with SMTP-auth credentials from a transactional service — happy to do that next.</li>
    <li><strong>If you see <code>mail-failures.log</code> in the diagnostic table above</strong> with a non-zero size after running tests, open it via your file manager — every failed send (including the customer's full message) is saved there as a recovery log.</li>
  </ul>
</div>

<p style="margin-top:2rem;border-top:1px solid #eee;padding-top:1rem;color:#666;font-size:.85rem">
  Once you're satisfied with the test results: delete <code>test-mail.php</code> and (if it exists) <code>.test-mail-ratelimit.json</code> from your web root.
</p>

</body>
</html>
