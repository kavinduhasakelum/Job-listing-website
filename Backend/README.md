# Job Listing Backend

Node.js + Express backend for the job listing platform. Below are quick-start notes for configuring environment variables and SMTP delivery.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in the required values. At minimum you need:

- Database connection (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- `JWT_SECRET`
- Cloudinary keys if you plan to upload assets
- SMTP credentials for transactional emails

3. Start the server in development mode:

```bash
npm run dev
```

## SMTP configuration

The application supports both Gmail and custom SMTP providers.

| Variable | Description |
| --- | --- |
| `SMTP_SERVICE` | Nodemailer service identifier (defaults to `gmail`). Ignored when `SMTP_HOST` is provided. |
| `SMTP_HOST` | Hostname of the SMTP server (e.g. `smtp.mailtrap.io`). |
| `SMTP_PORT` | Port number (587 for STARTTLS, 465 for SSL). If omitted while using `SMTP_HOST`, it defaults to `587`. |
| `SMTP_SECURE` | Set to `true` to force SSL/TLS (port 465). |
| `SMTP_USER` | SMTP username/account. Falls back to `EMAIL_USER` for backward compatibility. |
| `SMTP_PASS` | SMTP password or app password. Falls back to `EMAIL_PASS`. |
| `SMTP_FROM` | Optional default sender address (e.g. `"Job Portal <no-reply@example.com>"`). |

### Gmail specific notes

- Enable 2-Step Verification on the Gmail account (required by Google).
- Generate an App Password from [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords).
- Use the generated 16-character password as `SMTP_PASS` (or `EMAIL_PASS`).
- Google may block sign-in attempts from unfamiliar IP addresses; review alerts in your Google account if authentication continues to fail.

### Alternative providers

Set `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` for providers such as Mailtrap, SendGrid, or AWS SES. Leave `SMTP_SERVICE` unset in that case.

## Troubleshooting

- **`535-5.7.8 Username and Password not accepted`**: Authentication failed. For Gmail, the account needs an App Password. For other providers, verify the credentials and that your IP is allowed.
- **`Email transport not configured`**: `SMTP_USER`/`SMTP_PASS` (or the legacy `EMAIL_USER`/`EMAIL_PASS`) are missing.
- To debug locally without hitting a real inbox, consider using [Ethereal Email](https://ethereal.email/) or Mailtrap and populate the SMTP variables with their sandbox credentials.
