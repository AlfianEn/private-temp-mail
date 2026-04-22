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
- `INBOX_DOMAIN` = domain email inbox, mis. `box.qiassychecksheet.online`

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

## Production deploy templates
Files provided in `deploy/`:
- `deploy/private-temp-mail.service`
- `deploy/nginx-box.qiassychecksheet.online.conf`
- `deploy/private-temp-mail-cleanup.service`
- `deploy/private-temp-mail-cleanup.timer`

### App service install
```bash
cp .env.production.example .env.production
npm install
npm run db:push
npm run build
sudo cp deploy/private-temp-mail.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now private-temp-mail
sudo systemctl status private-temp-mail
```

### Nginx install
```bash
sudo cp deploy/nginx-box.qiassychecksheet.online.conf /etc/nginx/sites-available/private-temp-mail
sudo ln -s /etc/nginx/sites-available/private-temp-mail /etc/nginx/sites-enabled/private-temp-mail
sudo nginx -t
sudo systemctl reload nginx
```

### Cleanup timer install
```bash
sudo cp deploy/private-temp-mail-cleanup.service /etc/systemd/system/
sudo cp deploy/private-temp-mail-cleanup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now private-temp-mail-cleanup.timer
sudo systemctl list-timers | grep private-temp-mail-cleanup
```

### SMTP receiver notes
Basic SMTP receiver prep is included:
- `deploy/private-temp-mail-smtp.service`
- `scripts/haraka-forwarder.js`
- `haraka/README-SMTP.md`

This part still needs final server-side wiring for Haraka config + port 25 exposure.

## Notes
- Inbox retention target: 30 hari
- Tool ini dipisah dari `daily-checksheet-qa`
- Planned deployment subdomain: `box.qiassychecksheet.online`
- After nginx is live, issue HTTPS cert for `box.qiassychecksheet.online`
