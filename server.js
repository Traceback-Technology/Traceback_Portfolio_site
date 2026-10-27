// Traceback-Technology server
// Serves the website from /public and handles the feedback form at POST /api/contact
// Based on the backend code Thabang supplied, with a few safety fixes (listed in README.txt)

require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a proxy, so trust the first hop to get the real visitor IP
// (without this every visitor shares the same rate limit)
app.set('trust proxy', 1);

// small body limit, the form never needs more than a few KB
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// max 5 submissions per IP every 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions from this IP — please try again later.' }
});

// SMTP details come from the .env file (or Render's environment settings), never from the code
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  // on non-SSL ports (587, 2525, 26) insist on STARTTLS so the password is never sent in plain text
  requireTLS: process.env.SMTP_SECURE !== 'true',
  auth: {
    user: process.env.SMTP_USER, // cPanel: the full mailbox address, e.g. info@yourdomain.com
    pass: process.env.SMTP_PASS
  },
  // give up quickly instead of leaving the visitor on "Sending..." if the mail server can't be reached
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
});

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.CONTACT_RECEIVER_EMAIL
  );
}

const ALLOWED_TYPES = [
  'General feedback',
  'BC Ways feedback',
  'BC Eats feedback',
  'Question about the project'
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// stops visitor text from turning into HTML in the email
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// removes line breaks so nobody can sneak extra email headers into the subject
function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

app.post('/api/contact', contactLimiter, async (req, res) => {
  const body = req.body || {};

  // honeypot: bots fill this in, so we pretend it worked and send nothing
  if (body.honeypot) {
    return res.status(200).json({ success: true });
  }

  // make sure the fields are strings before we call string methods on them
  if (
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.message !== 'string' ||
    (body.projectType !== undefined && typeof body.projectType !== 'string')
  ) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const name = singleLine(body.name);
  const email = body.email.trim();
  const message = body.message.trim();
  const projectType = ALLOWED_TYPES.includes(body.projectType) ? body.projectType : 'General feedback';

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (name.length > 100 || email.length > 254) {
    return res.status(400).json({ error: 'Name or email is too long.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }

  // if the .env isn't filled in, fail safely without leaking details
  if (!isEmailConfigured()) {
    console.error('Email not configured: check your .env file (see .env.example).');
    return res.status(500).json({ error: 'Something went wrong sending your message. Please try again later.' });
  }

  try {
    await transporter.sendMail({
      // cPanel only lets you send as the mailbox you logged in with, so the sender must be SMTP_USER
      from: `"Traceback-Technology Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email, // so the team can reply straight to the visitor
      subject: `New ${projectType} message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nAbout: ${projectType}\n\nMessage:\n${message}`,
      html: `
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>About:</strong> ${escapeHtml(projectType)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(message).replace(/\r?\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err.message);
    res.status(500).json({ error: 'Something went wrong sending your message. Please try again later.' });
  }
});

// Render pings this to check the server is up
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// bad JSON or oversized bodies get a clean JSON error instead of a stack trace
app.use((err, req, res, next) => {
  if (req.path === '/api/contact') {
    return res.status(400).json({ error: 'Invalid request.' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // check the SMTP login once at startup so problems show up in the logs straight away
  if (!isEmailConfigured()) {
    console.warn('Email not configured: the feedback form will not send until the SMTP and CONTACT_RECEIVER_EMAIL settings are filled in.');
    return;
  }
  transporter.verify()
    .then(() => console.log(`SMTP ready: logged in to ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}`))
    .catch((err) => console.error('SMTP check failed:', err.message));
});
