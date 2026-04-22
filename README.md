# private-temp-mail

Private/internal temp mail + OTP inbox tool.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM
- JWT inbox access

## Current features
- Generate inbox
- JWT inbox link
- Inbox detail page
- Inbound email endpoint
- OTP extraction
- Refresh inbox
- Copy OTP
- 30-day cleanup script

## Environment
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Variables:
- `JWT_SECRET` = secret untuk sign/verify inbox JWT
- `INBOX_DOMAIN` = domain email inbox

## Local setup
```bash
npm install
npm run db:push
npm run dev
```

Default local app:
- `http://127.0.0.1:3000`

## Important routes
- `/` → generate inbox
- `/inbox?jwt=...` → lihat inbox by JWT
- `POST /api/inboxes/create` → buat inbox
- `POST /api/inbound` → terima email masuk

## Cleanup retention
Manual:

```bash
npm run cleanup
```

## Deploy notes
Project includes deployment templates for:
- app service
- nginx reverse proxy
- cleanup timer
- SMTP receiver wiring

Copy and adapt them to your own server/domain setup as needed.

## Notes
- Inbox retention target: 30 hari
- Tool ini dipisah dari app lain agar risiko dan operasional tetap terisolasi
- Jika repo public, hindari commit detail infra spesifik, secret, dan runtime files
