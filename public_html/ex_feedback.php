<?php
include_once("sendgrid_engine.php");

// Honeypot — silently drop bot submissions
if (!empty($_POST['company_website'])) {
    http_response_code(200);
    echo "ok";
    exit;
}

function og_field($name, $alt = null) {
    $v = isset($_POST[$name]) ? trim((string)$_POST[$name]) : '';
    if ($v === '' && $alt !== null && isset($_POST[$alt])) {
        $v = trim((string)$_POST[$alt]);
    }
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}

function og_row($label, $value) {
    if ($value === '' || $value === null) return '';
    return "<tr><td style='padding:6px 10px;width:140px;vertical-align:top'><strong>{$label}</strong></td><td style='padding:6px 10px'>{$value}</td></tr>";
}

$person_name  = og_field('name');
$person_email = og_field('email');
$phone        = og_field('phone');
$topic        = og_field('quote_for', 'quotefor');
$subject      = og_field('subject');
if ($subject === '') $subject = 'Customer feedback from octagreennano.com';
$message      = nl2br(og_field('message'));

$rows  = og_row('Name',     $person_name);
$rows .= og_row('Email',    $person_email);
$rows .= og_row('Phone',    $phone);
$rows .= og_row('Topic',    $topic);
$rows .= og_row('Feedback', $message);

$msg  = "<p style='font-family:sans-serif'>New customer feedback received via <strong>octagreennano.com</strong></p>";
$msg .= "<table style='background-color:#2f283e;color:#fff;border-radius:6px;font-family:sans-serif;width:560px;border-collapse:collapse'>{$rows}</table>";
$msg .= "<p style='font-family:sans-serif;color:#666;font-size:12px;margin-top:16px'>Sent from the feedback form on octagreennano.com</p>";

$sent = 0;
foreach (["stm0490@gmail.com", "prathish@octagreennano.com", "mail@octagreennano.com"] as $rcpt) {
    if (sendemail($rcpt, $subject, $msg)) { $sent++; }
}

if ($sent > 0) {
    echo "Thanks for your feedback — we appreciate it.";
} else {
    http_response_code(502);
    echo "Sorry, our mail server didn't respond. Please email mail@octagreennano.com or call +91 86065 11141 directly.";
}
