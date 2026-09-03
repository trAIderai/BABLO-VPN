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

## Requirements

- Ubuntu 24.04 LTS (clean VPS) — для других версий пути могут отличаться
- Root access
- Открытые порты: 80, 443 (TCP), 51820 (UDP), 2053, 8443, 8444 (TCP), 8445 (UDP)
- Домен, направленный A-записью на IP сервера (для авто-SSL через Caddy)

## Quick Install

`install.sh` интерактивно спросит домен и админский пароль, поставит Docker, AmneziaWG kernel module (через DKMS), пересоберёт `awg`/`awg-quick` для musl (Alpine-контейнер wg-easy), сгенерирует `.env` и поднимет стек.

```bash
curl -sSL https://raw.githubusercontent.com/trAIderai/BABLO-VPN/main/install.sh -o install.sh
sudo bash install.sh
```

> ⚠️ Не использовать `curl ... | sudo bash` — скрипт интерактивный (`read -p`), через pipe stdin занят curl'ом и ввод не работает.

## Configuration

Главный файл — `/opt/bablo-vpn/.env` (chmod 600). Ключевое:

| Переменная | Что | Откуда берётся |
|---|---|---|
| `WG_HOST` | домен (vpn.example.com) | спрашивает install.sh |
| `PASSWORD` | админ-пароль (cleartext) | спрашивает install.sh |
| `AWG_H1..H4`, `AWG_S1`, `AWG_S2`, `AWG_JC`, `AWG_JMIN`, `AWG_JMAX` | AmneziaWG obfuscation magic | генерится install.sh |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile CAPTCHA | опционально, дашборд Cloudflare |
| `VLESS_UUID`, `REALITY_PUBLIC_KEY`, `REALITY_SHORT_ID`, `TROJAN_PASSWORD`, `HYSTERIA2_PASSWORD` | от 3x-ui | заполнить вручную после настройки 3x-ui |

> ⚠️ Форк `ghcr.io/spcfox/amnezia-wg-easy` принимает **только cleartext `PASSWORD`**. `PASSWORD_HASH` он игнорирует — админка окажется открыта без пароля.

### AdGuard Home: пароль админки

`adguard/AdGuardHome.yaml` в git **не хранится** — в нём bcrypt-хэш админского пароля,
а репозиторий публичный. `install.sh` создаёт файл из `adguard/AdGuardHome.yaml.example`
при первом запуске. Задать или сменить пароль:

```bash
docker stop adguard-home     # обязательно: AdGuard перезаписывает свой yaml при выходе
python3 -c "import bcrypt,getpass; print(bcrypt.hashpw(getpass.getpass('Новый пароль: ').encode(), bcrypt.gensalt(rounds=12)).decode())"
# полученный хэш вставить в adguard/AdGuardHome.yaml -> users[0].password
# тот же пароль в открытом виде -> ADGUARD_PASS в .env (его читает vpn-ui)
# ВАЖНО: именно up --force-recreate, а НЕ docker start.
# adguard-home живёт в сетевом пространстве wg-easy (network_mode: service:wg-easy)
# и хранит ID того контейнера. После остановки docker перепроверяет ссылку, она
# оказывается устаревшей, и docker start падает с
#   joining network namespace of container: No such container: <id>
# Пересоздание привязывает его к текущему wg-easy заново.
docker compose up -d --force-recreate --no-deps adguard-home vpn-ui
```

> ⚠ Пока adguard-home остановлен, у клиентов пражского VPN не резолвится DNS
> (`WG_DEFAULT_DNS=10.8.0.1` смотрит именно на него). Правку делать быстро.

> ⚠ Админка AdGuard слушает `0.0.0.0:8053`, то есть доступна из интернета.
> Пароль должен быть стойким.

После правки `.env`: `cd /opt/bablo-vpn && docker compose up -d --force-recreate --no-deps wg-easy`.

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

- **WireGuard Backend:** [spcfox/amnezia-wg-easy](https://github.com/spcfox/amnezia-wg-easy) (AmneziaWG fork of wg-easy)
- **Xray Backend:** [3x-ui](https://github.com/MHSanaei/3x-ui)
- **Frontend:** Next.js 14 + Tailwind CSS
- **Reverse Proxy:** Caddy (auto SSL via Let's Encrypt)
- **DNS:** AdGuard Home (через WireGuard, порт 8053 для админки)
- **Kernel:** AmneziaWG kernel module — DKMS из `ppa:amnezia/ppa`, авто-пересборка при апгрейдах ядра

## Operations

**Состояние:** `cd /opt/bablo-vpn && docker compose ps`
**Логи:** `docker compose logs -f wg-easy`
**Рестарт сервиса:** `docker compose up -d --force-recreate --no-deps <service>`

## Troubleshooting

**`wg-easy` в `Restarting` цикле, `docker logs wg-easy` показывает `Cannot find device "wg0"` или `WireGuard exited with the error`:**
1. Проверить модуль: `lsmod | grep amneziawg`
2. Если пусто: `modprobe amneziawg` (если падает — модуль не собран для текущего ядра)
3. DKMS статус: `dkms status | grep amneziawg`
4. Если нет — `apt install --reinstall amneziawg-dkms` или `dkms autoinstall`
5. Headers ядра: `apt install linux-headers-$(uname -r)`

**`wg-easy` поднимается, но `wg-quick: /usr/bin/awg: No such file or directory` (внутри контейнера):**
- Хостовой `/usr/bin/awg` слинкован glibc, а контейнер на Alpine 3.15 (musl)
- Нужно пересобрать `awg`/`awg-quick` в Alpine 3.15 (см. блок в `install.sh`) и `install` поверх apt-овых
- Проверить `apt-mark showhold | grep amneziawg-tools` — должен быть в hold

**`/api/session` возвращает `{"requiresPassword":false,"authenticated":true}` (админка открыта без пароля):**
- В env контейнера должен быть **`PASSWORD`**, не `PASSWORD_HASH`:
  `docker exec wg-easy printenv PASSWORD` (должен показать твой пароль)
- Если пусто — проверь `/opt/bablo-vpn/.env` и строку `- PASSWORD=${PASSWORD}` в `docker-compose.yml`
- После правки: `docker compose up -d --force-recreate --no-deps wg-easy`

**После `apt upgrade` всё ломается:**
- `apt-mark unhold amneziawg-tools` НЕ делать без причины — apt вернёт glibc-версию `awg`, контейнер сломается
- Если случайно сделал unhold: повторить шаг сборки awg в Alpine 3.15 (`install.sh` блок «Building musl-compatible awg/awg-quick»)

---

## Безопасность репозитория

Репозиторий **публичный**. Боевые значения в него не попадают: под `.gitignore`
лежат `.env`, `adguard/AdGuardHome.yaml` и `ru-server/pbx.env`, а в репозитории
остаются только образцы с заглушками (`*.example`).

После клонирования включить хук, отклоняющий коммит с похожим на секрет:

```bash
git config core.hooksPath .githooks
```

Проверяются только **добавляемые** строки: bcrypt-хэши, приватные ключи,
ключи и PSK WireGuard, UUID, `PASSWORD=` с настоящим значением, пароль
открытым текстом, ключ Turnstile. Осознанно обойти — `git commit --no-verify`.

> История переписана 2026-09-03 (`git filter-repo`): вычищены пароль админки,
> bcrypt-хэш AdGuard, два UUID VLESS и `.claude/settings.local.json`. Все эти
> значения к тому моменту уже были ротированы или не действовали. Хэши коммитов
> после переписывания изменились — старые клоны нужно переклонировать, а не
> сливать.

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
