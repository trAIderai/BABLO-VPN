# BABLO VPN

Multi-protocol VPN management with custom UI in trAIder style.

## Supported Protocols

| Protocol | Port | Best For |
|----------|------|----------|
| **WireGuard** | 51820/udp | Fast, stable VPN |
| **VLESS** | 8443/tcp | Bypass DPI, stealth |
| **Trojan** | 8443/tcp | Disguise as HTTPS |
| **Hysteria2** | 8443/udp | Unstable networks |

## Features

- Custom dark theme UI matching trAIder platform
- Binance Gold accent colors
- Client management (add, delete, enable/disable)
- QR code generation for mobile setup
- Traffic statistics per client
- Real-time online status
- Automatic SSL via Caddy
- **3x-ui panel** for VLESS/Trojan/Hysteria management

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

| Service | URL/Port |
|---------|----------|
| **WireGuard UI** | https://YOUR_DOMAIN |
| **3x-ui Panel** | http://YOUR_IP:2053 |
| **WireGuard** | 51820/udp |
| **VLESS/Trojan** | 8443/tcp |
| **Hysteria2** | 8443/udp |

### 3x-ui Default Credentials
- **Login:** admin
- **Password:** admin
- **Change immediately after first login!**

## Stack

- **WireGuard Backend:** [wg-easy](https://github.com/wg-easy/wg-easy)
- **Xray Backend:** [3x-ui](https://github.com/MHSanaei/3x-ui)
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
