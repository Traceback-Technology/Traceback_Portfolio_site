# Traceback-Technology Website

The official website for **Traceback-Technology**, a team of eight student developers, and its current project, the **BC Smart Ecosystem** (also called *BC Smart Lifestyle* in the project proposal).

The site is a static multi-page website served by a small Node.js/Express server. The server also powers a feedback form that emails visitor messages to the team.

> **Organisation vs. project:** Traceback-Technology is the team/organisation. BC Smart Ecosystem is its current project, made up of two components: **BC Ways** and **BC Eats**. Keep this distinction consistent across all pages.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Security Notes](#security-notes)
- [Content Guidelines](#content-guidelines)
- [Outstanding Tasks](#outstanding-tasks)
- [The Team](#the-team)

---

## About the Project

**BC Smart Ecosystem** is a single application with more than one module, designed to modernise the student and visitor experience at Belgium Campus.

| Component | Purpose |
| --- | --- |
| **BC Ways** | Campus navigation and destination discovery: a searchable 2D map, shortest-route planning (Dijkstra's algorithm), GPS-based guidance and QR-code visitor access. |
| **BC Eats** | A digital tuckshop: real-time menu, pre-ordering with cashless payment, order tracking, and an admin dashboard with analytics. |

The problems it aims to address:

- **Navigation and orientation:** large campus layouts and static signage can leave students late and first-time visitors confused.
- **Dining inefficiency:** manual tuckshop orders cause long queues, human error and no real-time view of the menu.

> **Note on feature status:** The feature descriptions on the Showcase page come from the Group 10 project proposal. They describe intended functionality, and the app interfaces are still being built. Drone delivery for BC Eats is **proposed work**, not a finished feature. Please do not present planned features as implemented until the team confirms them.

---

## Features

### Website

- Five pages: Home, Products, Project Showcase, About Us and Meet the Team
- Shared header and footer across all pages, with a skip-to-content link for accessibility
- Single stylesheet (`style.css`) controlling the whole look, with a light visual direction (white and light blue) that keeps the Traceback-Technology branding
- Team cards for all eight members, with roles, leadership titles and credentials

### Feedback form (Project Showcase page)

- Visitors can send general feedback, BC Ways feedback, BC Eats feedback, or a question about the project
- Client-side validation for friendly errors, plus full server-side validation
- Delivered to the team inbox by email, with the visitor's address set as the reply-to
- Spam protection through a hidden honeypot field and per-IP rate limiting

---

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no build step)
- **Backend:** Node.js, Express 4
- **Email:** Nodemailer (SMTP)
- **Other dependencies:** `dotenv` (configuration), `express-rate-limit` (abuse protection)

---

## Project Structure

```
Traceback-Technology-Website/
├── public/                  # The website itself (served statically)
│   ├── index.html           # Home
│   ├── products.html        # Concise overview of BC Ways and BC Eats
│   ├── showcase.html        # Detailed project page + feedback form
│   ├── about.html           # About Us
│   ├── team.html            # Meet the Team
│   ├── style.css            # All site styling
│   ├── contact.js           # Feedback form logic (POST /api/contact)
│   └── images/              # Logos, team photos, placeholders
├── server.js                # Express server: static files + /api/contact
├── package.json             # Dependencies and scripts
├── .env.example             # Template for email settings (copy to .env)
├── render.yaml              # Render Blueprint (hosting config)
├── .vscode/settings.json    # Live Server port (5501)
└── README.md
```

**Page responsibilities** (kept deliberately distinct so pages don't repeat each other):

- **Home:** general introduction to Traceback-Technology
- **Products:** concise overview of BC Ways and BC Eats and how they fit together
- **Project Showcase:** the full explanation, intended value, screenshots, walkthrough video and feedback form
- **About Us / Meet the Team:** the team, its approach and its roles

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (a current LTS version is recommended)
- [VS Code](https://code.visualstudio.com/) (optional, for the Live Server option)

### Option 1: Browse the site only (no feedback form)

1. Extract the project and open the folder in VS Code.
2. Right-click `public/index.html` and choose **Open with Live Server**.

The pages work normally, but the feedback form cannot send anything because Live Server has no backend. The form will tell the visitor the service is unavailable.

### Option 2: Run the full site with the working feedback form

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file from the template:

   ```bash
   cp .env.example .env        # macOS / Linux / Git Bash
   copy .env.example .env      # Windows Command Prompt
   ```

3. Open `.env` and fill in your SMTP details and the receiving inbox (see [Environment Variables](#environment-variables)).

4. Start the server:

   ```bash
   npm start
   ```

5. Open <http://localhost:3000> in your browser.

Email is only delivered if the SMTP settings are valid. If they are missing or wrong, the visitor sees a friendly error and the real reason is printed in the terminal.

---

## Environment Variables

Configured in `.env` (copied from `.env.example`). **Never commit or share your `.env` file.**

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Port the server listens on (defaults to `3000`) | `3000` |
| `SMTP_HOST` | SMTP server from your email provider | `smtp.example.com` |
| `SMTP_PORT` | SMTP port (defaults to `465`) | `465` |
| `SMTP_SECURE` | `true` for port 465, `false` for port 587 | `true` |
| `SMTP_USER` | SMTP username (also used as the sender address) | `your-smtp-username` |
| `SMTP_PASS` | SMTP password | `your-smtp-password` |
| `CONTACT_RECEIVER_EMAIL` | Inbox that receives the feedback emails | `team-inbox@example.com` |

If `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` or `CONTACT_RECEIVER_EMAIL` is missing, the server logs a configuration error and returns a generic failure message without leaking details.

### Using the cPanel domain mailbox

Find the exact values under **cPanel > Email Accounts > Connect Devices** for the mailbox:

- `SMTP_HOST`: the outgoing server, usually `mail.yourdomain.com`
- `SMTP_PORT` / `SMTP_SECURE`: `465` / `true` (SSL), or `587` / `false` (STARTTLS)
- `SMTP_USER`: the **full** email address; it is also the sender address, because cPanel only lets you send as the mailbox you log in with
- `SMTP_PASS`: that mailbox's password

On startup the server logs either `SMTP ready: ...` or `SMTP check failed: ...`, so check the logs first if mail isn't arriving.

---

## Deployment

The site is hosted on [Render](https://render.com) as a Node **Web Service**, with the team domain pointed at it.

### 1. Create the service

1. Push this repo to GitHub.
2. In Render choose **New > Blueprint** and select the repo. `render.yaml` sets the build (`npm ci`), start (`npm start`) and health check (`/healthz`).
3. Fill in the secret values Render asks for (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECEIVER_EMAIL`).
4. Check the deploy logs for `SMTP ready`, then open the `*.onrender.com` URL.

> **Important:** Render's **free** instance type blocks outgoing SMTP traffic (ports 25, 465 and 587), so the feedback form will time out there. Use a paid instance type such as **Starter**, or ask your cPanel host whether it accepts SMTP on another port (such as `2525`) and set `SMTP_PORT` and `SMTP_SECURE=false` to match.

### 2. Connect the domain

1. In Render: **Settings > Custom Domains**, then add both `yourdomain.com` and `www.yourdomain.com`.
2. In **cPanel > Zone Editor** (or wherever your DNS is managed), add the records Render shows:
   - `www` → **CNAME** → `your-service.onrender.com`
   - root domain (`@`) → **A** record → the IP Render shows (replaces the old cPanel IP)
3. **Protect email before changing the root A record.** cPanel usually points `mail` and the MX record at the root domain. If the root moves to Render, email breaks. Before switching:
   - change `mail.yourdomain.com` to its own **A** record with the cPanel server IP (the old root A value)
   - make sure the **MX** record points to `mail.yourdomain.com`, not to the bare domain
   - leave the SPF (TXT) and DKIM records as they are
4. Click **Verify** in Render. It issues the HTTPS certificate automatically once DNS has propagated (minutes to a few hours).

---

## API Reference

### `POST /api/contact`

Sends a feedback message to the team inbox.

**Request body (JSON):**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Max 100 characters |
| `email` | string | Yes | Must be a valid email, max 254 characters |
| `message` | string | Yes | Max 5000 characters |
| `projectType` | string | No | One of the allowed types below; anything else falls back to `General feedback` |
| `honeypot` | string | No | Must be empty; if filled, the request is silently ignored |

**Allowed `projectType` values:** `General feedback`, `BC Ways feedback`, `BC Eats feedback`, `Question about the project`

**Responses:**

| Status | Body | Meaning |
| --- | --- | --- |
| `200` | `{ "success": true }` | Message sent (or honeypot triggered) |
| `400` | `{ "error": "..." }` | Missing or invalid fields, or malformed request |
| `429` | `{ "error": "Too many submissions..." }` | Rate limit exceeded |
| `500` | `{ "error": "..." }` | Email not configured or sending failed |

**Example:**

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","projectType":"BC Ways feedback","message":"Great idea!"}'
```

---

## Security Notes

- **Secrets stay out of code.** SMTP credentials are read from `.env` only.
- **Rate limiting:** a maximum of 5 submissions per IP every 15 minutes.
- **Honeypot field** catches simple bots without bothering real visitors.
- **Small request bodies:** JSON bodies are capped at 20 KB.
- **HTML escaping:** visitor text is escaped before being placed in the email's HTML body.
- **Header injection protection:** line breaks are stripped from the name before it is used in the email subject.
- **Type checks:** all fields are verified to be strings before string methods are called.

---

## Content Guidelines

These come from the team's meeting notes (also left as comments in the HTML files):

- **Styling:** keep the Traceback-Technology branding with a lighter direction (more white and light blue). Apply visual changes through `style.css` consistently rather than page by page.
- **Naming:** Traceback-Technology is the team; BC Smart Ecosystem is the project; BC Ways and BC Eats are its parts.
- **Accuracy:** clearly separate implemented features from planned ones (GPS tracking, route recalculation, QR visitor access, payments, order tracking, dashboard, delivery and analytics).
- **Benefits:** the intended value for students, visitors and staff comes from the proposal and is not yet backed by survey data. Don't present it as a measured result.
- **No placeholder reviews:** keep the feedback form genuine; don't add fake testimonials.
- **Team page:** all eight members must stay listed, even without a photo. Confirm any role changes with the relevant person first.
- **Real assets only:** use real screenshots of the team's own app.

---

## Outstanding Tasks

- [ ] Add real SMTP settings and the receiving email address in `.env`
- [ ] Send a real test message and confirm it arrives and that replying works
- [ ] Add real BC Ways / BC Eats download or access URLs (see comments in `products.html`)
- [ ] Add real app screenshots (see comments in `showcase.html`)
- [ ] Record and add the walkthrough video (decide who records it and where it is hosted)
- [ ] Add both real logo files (a stand-in logo is currently used; see the header comment in each page)
- [ ] Add team photographs for Thabang Molise and Jimmy Junior Baloyi
- [ ] Confirm the spellings "Arnold Mabope" and "Tetelo Phahladira" (used as written in the proposal)
- [ ] Verify each BC Ways / BC Eats claim against the current implementation before publishing

---

## The Team

Eight students working across frontend, backend and robotics.

| Name | Role | Credential |
| --- | --- | --- |
| Thabang Molise | Project Lead | Robotics Engineer, Backend Developer |
| Tetelo Phahladira | Project Lead | Full-Stack Developer |
| Anele Nkayi | Frontend Project Lead | Frontend Developer |
| Arnold Mabope | Backend Project Lead | Backend Developer |
| Mufunwa Muofhe | Team member | Backend Developer |
| Dzanga Madi | Team member | Frontend Developer |
| Puleng Ramorapeli | Team member | Frontend Developer |
| Jimmy Junior Baloyi | Team member | Frontend Developer |

---

&copy; 2026 Traceback-Technology. All rights reserved.