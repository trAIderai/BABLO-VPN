#!/usr/bin/env bash
#
# BABLO VPN — тонкий выходной узел (Москва).
#
# Ставит ТОЛЬКО AmneziaWG на голое железо: без Docker, без Caddy, без UI.
# Причина: узел нужен как выход с российским IP для SIP-телефонии, а бокс
# слабый (1 ГБ RAM, HDD). Заодно это обходит весь класс граблей из
# README.md → Troubleshooting: они все про Alpine-контейнер wg-easy
# (musl vs glibc для awg/awg-quick). На хосте этой проблемы нет.
#
# Управление панелью остаётся на пражском сервере — сюда она не нужна.
#
# Запуск:  sudo bash install-exit.sh
#
set -euo pipefail

WG_IF="awg0"
WG_SUBNET="10.9.0"          # НЕ 10.8.0 — чтобы профили Праги и Москвы не конфликтовали
WG_PORT="${WG_PORT:-48920}" # нестандартный порт: 51820 слишком узнаваем для DPI
WG_MTU="1280"               # как в Праге: запас под инкапсуляцию, меньше фрагментации на мобильных
CLIENT_DNS="77.88.8.8, 77.88.8.1"  # российский резолвер: RU-сайты должны резолвиться в RU-узлы CDN
CONF_DIR="/etc/amnezia/amneziawg"
STATE_DIR="/opt/bablo-exit"

log()  { echo -e "\n\033[1;33m>>> $*\033[0m"; }
fail() { echo -e "\n\033[1;31mОШИБКА: $*\033[0m" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail "нужен root"

# ---------------------------------------------------------------- пакеты
log "Устанавливаю пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -yqq software-properties-common curl qrencode iptables

log "Подключаю ppa:amnezia/ppa и ставлю AmneziaWG"
add-apt-repository -y ppa:amnezia/ppa
apt-get update -qq
apt-get install -yqq "linux-headers-$(uname -r)" || \
  echo "ВНИМАНИЕ: заголовки для $(uname -r) не найдены — DKMS может не собраться"
apt-get install -yqq amneziawg amneziawg-tools

# ------------------------------------------------- ядерный модуль или userspace
log "Проверяю ядерный модуль amneziawg"
USERSPACE=0
if modprobe amneziawg 2>/dev/null && lsmod | grep -q amneziawg; then
    echo "OK: ядерный модуль загружен"
else
    echo "Ядерный модуль недоступен (вероятно контейнерная виртуализация LXC/OpenVZ)."
    echo "Перехожу на userspace-реализацию amneziawg-go — медленнее, но рабочая."
    apt-get install -yqq amneziawg-go || fail "amneziawg-go не ставится — на этом хосте AmneziaWG не поднять"
    USERSPACE=1
fi

# ---------------------------------------------------------------- форвардинг
log "Включаю IP-форвардинг"
cat > /etc/sysctl.d/99-bablo-exit.conf <<'SYSCTL'
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
SYSCTL
sysctl -q --system

# ---------------------------------------------------------------- ключи и obfuscation
mkdir -p "$CONF_DIR" "$STATE_DIR"
chmod 700 "$CONF_DIR" "$STATE_DIR"

if [[ ! -f "$STATE_DIR/server.key" ]]; then
    log "Генерирую ключи сервера"
    (umask 077; awg genkey > "$STATE_DIR/server.key")
    awg pubkey < "$STATE_DIR/server.key" > "$STATE_DIR/server.pub"
fi
SRV_PRIV=$(cat "$STATE_DIR/server.key")
SRV_PUB=$(cat "$STATE_DIR/server.pub")

# Параметры обфускации AmneziaWG. H1..H4 ОБЯЗАНЫ отличаться от пражских —
# одинаковые magic headers на двух узлах дают общий фингерпринт для DPI.
if [[ ! -f "$STATE_DIR/obfuscation.env" ]]; then
    log "Генерирую параметры обфускации (уникальные для этого узла)"
    rnd() { shuf -i 1000000-2000000000 -n 1; }
    H1=$(rnd); H2=$(rnd); H3=$(rnd); H4=$(rnd)
    while [[ "$H2" == "$H1" ]]; do H2=$(rnd); done
    while [[ "$H3" == "$H1" || "$H3" == "$H2" ]]; do H3=$(rnd); done
    while [[ "$H4" == "$H1" || "$H4" == "$H2" || "$H4" == "$H3" ]]; do H4=$(rnd); done
    S1=$(shuf -i 15-150 -n 1)
    S2=$(shuf -i 15-150 -n 1)
    while [[ $((S1 + 56)) -eq "$S2" ]]; do S2=$(shuf -i 15-150 -n 1); done  # требование AmneziaWG
    cat > "$STATE_DIR/obfuscation.env" <<OBF
JC=5
JMIN=50
JMAX=1000
S1=$S1
S2=$S2
H1=$H1
H2=$H2
H3=$H3
H4=$H4
OBF
    chmod 600 "$STATE_DIR/obfuscation.env"
fi
# shellcheck disable=SC1091
source "$STATE_DIR/obfuscation.env"

# ---------------------------------------------------------------- конфиг сервера
NIC=$(ip -4 route show default | awk '{print $5; exit}')
[[ -n "$NIC" ]] || fail "не определяется внешний интерфейс"
PUBLIC_IP=$(curl -4 -s --max-time 10 https://api.ipify.org || true)
[[ -n "$PUBLIC_IP" ]] || PUBLIC_IP=$(ip -4 addr show "$NIC" | awk '/inet /{print $2}' | cut -d/ -f1 | head -1)

log "Пишу $CONF_DIR/$WG_IF.conf (внешний интерфейс: $NIC, публичный IP: $PUBLIC_IP)"
cat > "$CONF_DIR/$WG_IF.conf" <<CONF
[Interface]
Address = ${WG_SUBNET}.1/24
ListenPort = ${WG_PORT}
PrivateKey = ${SRV_PRIV}
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

PostUp = iptables -t nat -A POSTROUTING -s ${WG_SUBNET}.0/24 -o ${NIC} -j MASQUERADE
PostUp = iptables -A FORWARD -i %i -j ACCEPT
PostUp = iptables -A FORWARD -o %i -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -s ${WG_SUBNET}.0/24 -o ${NIC} -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT
PostDown = iptables -D FORWARD -o %i -j ACCEPT
CONF
chmod 600 "$CONF_DIR/$WG_IF.conf"

cat > "$STATE_DIR/node.env" <<NODE
PUBLIC_IP="$PUBLIC_IP"
WG_PORT="$WG_PORT"
WG_IF="$WG_IF"
WG_SUBNET="$WG_SUBNET"
WG_MTU="$WG_MTU"
SRV_PUB="$SRV_PUB"
CLIENT_DNS="$CLIENT_DNS"
CONF_DIR="$CONF_DIR"
STATE_DIR="$STATE_DIR"
USERSPACE="$USERSPACE"
NODE

# ---------------------------------------------------------------- запуск
log "Поднимаю интерфейс и включаю автозапуск"
systemctl enable --now "awg-quick@$WG_IF"
sleep 2
awg show "$WG_IF" >/dev/null || fail "интерфейс $WG_IF не поднялся — смотри journalctl -u awg-quick@$WG_IF"

echo
echo "==========================================================="
echo " Узел поднят."
echo "   Публичный IP  : $PUBLIC_IP"
echo "   Порт          : ${WG_PORT}/udp   (открой его в фаерволе провайдера)"
echo "   Реализация    : $([[ $USERSPACE -eq 1 ]] && echo 'userspace (amneziawg-go)' || echo 'ядерный модуль')"
echo
echo " Дальше:"
echo "   1) проверить белый список PBX:   python3 sip-probe.py"
echo "   2) добавить клиента:             bash add-client.sh iPhone14"
echo "==========================================================="
