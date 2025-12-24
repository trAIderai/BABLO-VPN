#!/bin/bash
# BABLO VPN - Установочный скрипт
# Для Ubuntu 22.04

set -e

echo "=========================================="
echo "   BABLO VPN - Установка wg-easy"
echo "=========================================="

# Обновление системы
echo "[1/5] Обновление системы..."
apt update && apt upgrade -y

# Установка Docker
echo "[2/5] Установка Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "Docker уже установлен"
fi

# Установка Docker Compose плагина
echo "[3/5] Проверка Docker Compose..."
docker compose version || apt install -y docker-compose-plugin

# Создание директории проекта
echo "[4/5] Создание проекта..."
mkdir -p /opt/bablo-vpn
cd /opt/bablo-vpn

# Создание docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  wg-easy:
    image: ghcr.io/wg-easy/wg-easy:15
    container_name: wg-easy
    environment:
      - LANG=ru
      - WG_HOST=bablo.bot
      - PASSWORD=Superb2016@
      - WG_PORT=51820
      - WG_DEFAULT_DNS=1.1.1.1, 8.8.8.8
      - WG_ALLOWED_IPS=0.0.0.0/0, ::/0
      - WG_DEFAULT_ADDRESS=10.8.0.x
      - PORT=51821
    volumes:
      - wg-easy-data:/etc/wireguard
    ports:
      - "51820:51820/udp"
      - "51821:51821/tcp"
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
      - net.ipv4.ip_forward=1
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    restart: unless-stopped
    depends_on:
      - wg-easy

volumes:
  wg-easy-data:
  caddy-data:
  caddy-config:
EOF

# Создание Caddyfile для HTTPS
cat > Caddyfile << 'EOF'
bablo.bot {
    reverse_proxy wg-easy:51821
}
EOF

# Открытие портов в firewall (если UFW активен)
echo "[5/5] Настройка firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 51820/udp
    echo "y" | ufw enable || true
fi

# Запуск контейнеров
echo "=========================================="
echo "   Запуск BABLO VPN..."
echo "=========================================="
docker compose up -d

# Ожидание запуска
sleep 5

# Статус
echo ""
echo "=========================================="
echo "   УСТАНОВКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Админ-панель: https://bablo.bot"
echo "Пароль: Superb2016@"
echo ""
echo "WireGuard порт: 51820/udp"
echo ""
echo "Проверка статуса: docker compose ps"
echo "Логи: docker compose logs -f"
echo "=========================================="
