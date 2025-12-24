#!/bin/bash
# BABLO VPN - Установочный скрипт с кастомным UI
# Для Ubuntu 22.04

set -e

echo "=========================================="
echo "   BABLO VPN - Установка"
echo "=========================================="

# Обновление системы
echo "[1/6] Обновление системы..."
apt update && apt upgrade -y

# Установка Docker
echo "[2/6] Установка Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "Docker уже установлен"
fi

# Установка Docker Compose плагина
echo "[3/6] Проверка Docker Compose..."
docker compose version || apt install -y docker-compose-plugin

# Установка Git
echo "[4/6] Проверка Git..."
apt install -y git

# Клонирование или обновление репозитория
echo "[5/6] Загрузка проекта..."
if [ -d "/opt/bablo-vpn" ]; then
    cd /opt/bablo-vpn
    git pull origin main || true
else
    git clone https://github.com/trAIderai/BABLO-VPN.git /opt/bablo-vpn
    cd /opt/bablo-vpn
fi

# Открытие портов в firewall (если UFW активен)
echo "[6/6] Настройка firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 51820/udp
    echo "y" | ufw enable || true
fi

# Остановка старых контейнеров
echo "=========================================="
echo "   Остановка старых контейнеров..."
echo "=========================================="
docker stop wg-easy caddy vpn-ui 2>/dev/null || true
docker rm wg-easy caddy vpn-ui 2>/dev/null || true

# Сборка и запуск контейнеров
echo "=========================================="
echo "   Сборка и запуск BABLO VPN..."
echo "=========================================="
docker compose build --no-cache
docker compose up -d

# Ожидание запуска
sleep 10

# Статус
echo ""
echo "=========================================="
echo "   УСТАНОВКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
docker compose ps
echo ""
echo "Админ-панель: https://vpn.bablo.bot"
echo "Пароль: Superb2016@"
echo ""
echo "WireGuard порт: 51820/udp"
echo ""
echo "Проверка статуса: cd /opt/bablo-vpn && docker compose ps"
echo "Логи: cd /opt/bablo-vpn && docker compose logs -f"
echo "=========================================="
