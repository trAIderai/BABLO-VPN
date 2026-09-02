# Московский выходной узел

Отдельный тонкий узел с российским IP. Нужен потому, что SIP-провайдер
(`<tenant>.pbx.<provider>.io`, Kamailio на `<PBX_IP>`, Люберцы) с 01.09.2026
отбивает регистрацию с нероссийских адресов:

```
REGISTER sip:<tenant>.pbx.<provider>.io  ->  <PBX_IP>:5060/udp
SIP/2.0 403 IP not in whitelist
received=<VPN_IP>            <- PBX видел пражский IP
```

Провайдер отказался вносить пражский адрес в белый список и сообщил, что
российские IP вносить не требуется — они проходят сами.

## Чем отличается от пражского сервера

| | Прага | Москва |
|---|---|---|
| Роль | основной VPN, панель, почта | только выход с RU-адресом |
| Стек | Docker: wg-easy + 3x-ui + Hysteria2 + AdGuard + Caddy + Next.js | голый AmneziaWG, без Docker |
| Подсеть | `10.8.0.0/24` | `10.9.0.0/24` |
| Порт | `51820/udp` | `48920/udp` |
| Управление | веб-панель | `add-client.sh` |

Панель сюда не ставится: `next build` на 1 ГБ RAM и HDD вероятнее всего уйдёт в OOM,
а голая установка вдобавок обходит весь раздел Troubleshooting корневого README —
там все грабли про musl-сборку `awg` для Alpine-контейнера, которого здесь нет.

## Порядок

```bash
scp ru-server/*.sh ru-server/*.py root@<MSK_IP>:/root/

# 1. ГЕЙТ: проходит ли IP этого сервера белый список PBX
python3 sip-probe.py
#   401 Unauthorized        -> прошёл, ставим узел
#   403 IP not in whitelist -> адрес не годится, дальше смысла нет

# 2. установка
bash install-exit.sh

# 3. профиль для телефона
bash add-client.sh iPhone14
```

Порт `48920/udp` открыть в фаерволе провайдера.

## Решения и почему так

**Полный туннель, а не маршрутизация по домену провайдера.** Сигнализация SIP и
медиа RTP идут на разные адреса, причём медиа-узлы PBX выдаёт динамически в SDP
во время звонка. Правило «домен провайдера -> Москва» поймает регистрацию и
потеряет звук. Поэтому московский профиль гонит весь трафик.

**AmneziaWG (UDP), а не VLESS Reality (TCP).** RTP внутри TCP-туннеля при потерях
даёт TCP-over-TCP meltdown: заикания и рост задержки. Для голоса нужен UDP.
Reality остаётся третьим эшелоном, если ТСПУ прибьёт UDP на трансграничном плече.

**`PersistentKeepalive = 25` в профиле клиента.** Держит UDP-маппинг в NAT
оператора. Без него входящий звонок не дойдёт до уснувшего телефона.

**`H1..H4` уникальны для узла.** Совпадение magic headers с пражскими дало бы
двум узлам общий фингерпринт для DPI.

**DNS клиента — российский резолвер (77.88.8.8).** При московском выходе
RU-сайты должны резолвиться в российские узлы CDN.

**Нестандартный порт `48920`.** `51820` слишком узнаваем; обфускация AmneziaWG
делает основную работу, но лишний слой бесплатен.


## Панель управления (этап 2)

Узел изначально поднят headless. Панель добавлена поверх, **без перевыпуска
профилей**: `migrate-to-panel.py` собирает `wg0.json` из уже существующих
ключей, поэтому wg-easy подхватывает прежний ключ сервера и всех клиентов.
Без этого шага панель при первом запуске сгенерировала бы новый ключ и все
розданные QR умерли бы.

```bash
scp ru-server/docker-compose.msk.yml root@<MSK_IP>:/opt/bablo-vpn/docker-compose.yml
scp ru-server/Caddyfile.msk          root@<MSK_IP>:/opt/bablo-vpn/Caddyfile
scp ru-server/migrate-to-panel.py    root@<MSK_IP>:/root/

# .env: WG_HOST, PASSWORD и AWG_* — последние копируются из
# /opt/bablo-exit/obfuscation.env и ОБЯЗАНЫ совпасть с выданными конфигами

python3 /root/migrate-to-panel.py                      # -> /tmp/wg0.json
systemctl disable --now awg-quick@awg0                 # голый узел уступает место
docker volume create bablo-vpn_wg-easy-data
docker run --rm -v bablo-vpn_wg-easy-data:/data -v /tmp/wg0.json:/src.json:ro     alpine sh -c 'cp /src.json /data/wg0.json && chmod 600 /data/wg0.json'
docker compose up -d wg-easy                           # caddy ТОЛЬКО после задания PASSWORD
```

### ★★★ musl-`awg`: собирать, а не копировать с другого сервера

Образ wg-easy — Alpine 3.15 и несёт обычный `wg`, поэтому `awg` монтируется
снаружи. Соблазн скопировать готовый бинарь с пражского сервера **не работает**:
там `amneziawg-tools` стоит на `apt-mark hold`, версия старая, а модуль ядра
здесь свежий. Симптом — контейнер в цикле перезапуска и в логах:

```
[#] awg setconf wg0 /dev/fd/63
Unable to modify interface: Invalid argument
```

Собирать из исходников, **статически**, чтобы не зависеть ещё и от версии musl
в контейнере, и класть в `/opt/bablo-vpn/bin/` — а не поверх `/usr/bin` хоста,
как делает корневой `install.sh`. Тогда хостовые glibc-бинари остаются рабочими
и откат на `awg-quick@awg0` выполняется одной командой.

```bash
docker run --rm -v /root/awg-build:/out alpine:3.15 sh -c '
  apk add --no-cache git make gcc musl-dev linux-headers libmnl-dev libmnl-static bash &&
  cd /tmp && git clone --depth 1 https://github.com/amnezia-vpn/amneziawg-tools.git &&
  cd amneziawg-tools/src && make LDFLAGS="-static" && make install &&
  cp /usr/bin/awg /usr/bin/awg-quick /out/'
```

Сверить версию собранного с хостовой: `awg --version` должны совпасть.

### Проверка после переключения

```bash
docker exec wg-easy awg show wg0 public-key   # обязан совпасть с /opt/bablo-exit/server.pub
curl -s https://<домен>/api/session            # {"requiresPassword":true,...}
```

Второй запрос критичен: форк принимает только cleartext `PASSWORD`,
`PASSWORD_HASH` он игнорирует — при пустом пароле панель открыта всем.
Поэтому `caddy` поднимается ТОЛЬКО после того, как пароль задан.

## Открытые вопросы (проверяются после развёртывания)

1. Переживает ли туннель засыпание iPhone — от этого зависят **входящие** звонки.
   Исходящие проверяются сразу, входящие тестировать отдельно, при заблокированном экране.
2. Пропускает ли ТСПУ AmneziaWG на плече Казахстан -> Россия. Если нет — включаем
   Hysteria2 (QUIC/UDP) вторым протоколом.

## План Б

Если `sip-probe.py` даст `403` и на московском хостинге (то есть белый список
режет дата-центровые сети целиком) — нужен резидентный российский адрес:
микро-сервер или роутер с AmneziaWG у кого-то дома в России. Минусы: аптайм,
серый IP за CGNAT у части провайдеров, нужен DDNS.
