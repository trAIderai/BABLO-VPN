# BABLO VPN

WireGuard VPN management with custom UI in trAIder style.

## Features

- Custom dark theme UI matching trAIder platform
- Binance Gold accent colors
- Client management (add, delete, enable/disable)
- QR code generation for mobile setup
- Traffic statistics per client
- Real-time online status
- Automatic SSL via Caddy

## Quick Install

```bash
curl -sSL https://raw.githubusercontent.com/trAIderai/BABLO-VPN/main/install.sh | bash
```

## Manual Install

```bash
git clone https://github.com/trAIderai/BABLO-VPN.git /opt/bablo-vpn
cd /opt/bablo-vpn
docker compose up -d
```

## Access

- **URL:** https://vpn.bablo.bot
- **WireGuard Port:** 51820/udp

## Stack

- **VPN Backend:** [wg-easy](https://github.com/wg-easy/wg-easy)
- **Frontend:** Next.js 14 + Tailwind CSS
- **Reverse Proxy:** Caddy (auto SSL)

---

## Credits

This project is built on top of the amazing **[wg-easy](https://github.com/wg-easy/wg-easy)** project.

Big thanks to the wg-easy team for creating such a convenient WireGuard management solution!

**wg-easy** provides:
- WireGuard server management
- Client configuration generation
- REST API for client management
- Traffic statistics

We use wg-easy as the backend and provide a custom frontend UI that matches our trAIder platform design.

---

## License

MIT
