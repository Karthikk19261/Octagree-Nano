<?php
/**
 * Mail engine — uses PHP's built-in mail() function.
 *
 * Background: the previous SendGrid v2 credentials (api_user='ayurmed', api_key='admin@13')
 * stopped authenticating against SendGrid's API. Form submissions were silently failing,
 * because the old code never inspected the curl response and always echoed "submitted".
 *
 * This implementation drops SendGrid entirely and uses the host's local sendmail.
 * Most shared LAMP hosts (cPanel, Plesk, Hostinger, etc.) have it pre-configured.
 *
 * Trade-offs vs a transactional service:
 *   - Pros: zero external dependencies, no API keys, no rotating creds.
 *   - Cons: emails land in spam more often without DKIM/SPF setup,
 *           no delivery telemetry, can hit shared-host rate limits.
 *
 * Failed sends are logged to mail-failures.log (in this same folder) so leads
 * are never lost completely. Check that file periodically; if it grows large,
 * configure SPF/DKIM at your DNS provider or upgrade to SendGrid v3 / Resend.
 *
 * Filename kept as sendgrid_engine.php for backward compatibility with the
 * three ex_*.php callers that include_once this file.
 */

function sendemail($to, $subject, $message) {
    $fromName  = 'Octagreen Nano';
    $fromEmail = 'noreply@octagreennano.com';

    // Encode subject for non-ASCII safety (RFC 2047)
    $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    $headers  = "From: {$fromName} <{$fromEmail}>\r\n";
    $headers .= "Reply-To: {$fromEmail}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: octagreennano.com (mail())\r\n";

    // -f sets the envelope sender. Some shared hosts ignore or reject this;
    // suppress the resulting warning with @ so we still get a clean bool back.
    $ok = @mail($to, $encSubject, $message, $headers, '-f' . $fromEmail);

    if (!$ok) {
        $logFile = __DIR__ . '/mail-failures.log';
        $err = error_get_last();
        $entry = sprintf(
            "[%s] mail() FAILED — to=%s subject=%s err=%s\n%s\n--- end of submission ---\n\n",
            date('Y-m-d H:i:s'),
            $to,
            $subject,
            $err && isset($err['message']) ? $err['message'] : 'unknown',
            $message
        );
        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }

    return $ok;
}
