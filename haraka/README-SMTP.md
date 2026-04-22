# SMTP inbound setup notes

Current plan: use Haraka as inbound-only SMTP receiver for `box.qiassychecksheet.online`.

## Important
The generated plugin file to forward mail into the app is:
- `scripts/haraka-forwarder.js`

You will still need to initialize Haraka config properly on the server and wire the custom plugin into Haraka's plugin list.

## DNS expectation
- MX for `box.qiassychecksheet.online` -> `mx.qiassychecksheet.online`
- `mx.qiassychecksheet.online` -> VPS IP

## Ports
- SMTP inbound requires TCP/25 reachable from the internet.

## Recommended next step
Initialize Haraka config directory on the server, then copy/link the custom plugin and enable it in `config/plugins`.
