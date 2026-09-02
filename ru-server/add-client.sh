#!/usr/bin/env bash
#
# Добавляет клиента на московский выходной узел и печатает .conf + QR.
#
# Запуск:  bash add-client.sh <имя>
# Пример:  bash add-client.sh iPhone14
#
set -euo pipefail

STATE_DIR="/opt/bablo-exit"
[[ $EUID -eq 0 ]] || { echo "нужен root" >&2; exit 1; }
[[ -f "$STATE_DIR/node.env" ]] || { echo "узел не установлен — сперва install-exit.sh" >&2; exit 1; }

# shellcheck disable=SC1091
source "$STATE_DIR/node.env"
# shellcheck disable=SC1091
source "$STATE_DIR/obfuscation.env"

NAME="${1:-}"
[[ -n "$NAME" ]] || { echo "укажи имя: bash add-client.sh <имя>" >&2; exit 1; }
SAFE_NAME=$(echo "$NAME" | tr -cd 'A-Za-z0-9_.-')
[[ -n "$SAFE_NAME" ]] || { echo "имя должно содержать буквы или цифры" >&2; exit 1; }

CLIENT_DIR="$STATE_DIR/clients"
mkdir -p "$CLIENT_DIR"; chmod 700 "$CLIENT_DIR"
OUT="$CLIENT_DIR/$SAFE_NAME.conf"
[[ -e "$OUT" ]] && { echo "клиент '$SAFE_NAME' уже есть: $OUT" >&2; exit 1; }

# следующий свободный адрес: .1 занят сервером
USED=$(grep -hoE "${WG_SUBNET//./\.}\.[0-9]+" "$CONF_DIR/$WG_IF.conf" "$CLIENT_DIR"/*.conf 2>/dev/null \
       | awk -F. '{print $4}' | sort -n | uniq)
OCTET=2
while echo "$USED" | grep -qx "$OCTET"; do OCTET=$((OCTET + 1)); done
[[ $OCTET -le 254 ]] || { echo "адреса в подсети кончились" >&2; exit 1; }
CLIENT_IP="${WG_SUBNET}.${OCTET}"

CLIENT_PRIV=$(awg genkey)
CLIENT_PUB=$(echo "$CLIENT_PRIV" | awg pubkey)
PSK=$(awg genpsk)

# Пир на сервере — сперва в живой интерфейс, потом в конфиг (переживёт рестарт)
awg set "$WG_IF" peer "$CLIENT_PUB" preshared-key <(echo "$PSK") allowed-ips "${CLIENT_IP}/32"
cat >> "$CONF_DIR/$WG_IF.conf" <<PEER

[Peer]
# $SAFE_NAME (добавлен $(date -u +%Y-%m-%d))
PublicKey = $CLIENT_PUB
PresharedKey = $PSK
AllowedIPs = ${CLIENT_IP}/32
PEER

# AllowedIPs = 0.0.0.0/0 — полный туннель. Для SIP это не роскошь: сигнализация и
# медиа (RTP) идут на РАЗНЫЕ адреса, которые PBX выдаёт динамически в SDP, поэтому
# маршрутизация «только домен провайдера» ловит регистрацию и теряет звук.
#
# PersistentKeepalive = 25 — обязателен: держит UDP-маппинг в NAT оператора живым,
# иначе входящий звонок не дойдёт до уснувшего телефона.
(umask 077; cat > "$OUT" <<CLIENT
[Interface]
PrivateKey = $CLIENT_PRIV
Address = ${CLIENT_IP}/32
DNS = ${CLIENT_DNS}
MTU = ${WG_MTU}

Jc = ${JC}
Jmin = ${JMIN}
Jmax = ${JMAX}
S1 = ${S1}
S2 = ${S2}
H1 = ${H1}
H2 = ${H2}
H3 = ${H3}
H4 = ${H4}

[Peer]
PublicKey = ${SRV_PUB}
PresharedKey = ${PSK}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${PUBLIC_IP}:${WG_PORT}
PersistentKeepalive = 25
CLIENT
)

echo "Клиент '$SAFE_NAME' -> $CLIENT_IP"
echo "Файл: $OUT"
echo
echo "--- QR для AmneziaVPN (Настройки -> Добавить -> Сканировать) ---"
qrencode -t ansiutf8 < "$OUT"
echo
echo "--- содержимое .conf ---"
cat "$OUT"
