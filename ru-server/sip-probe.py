#!/usr/bin/env python3
"""
Проверка белого списка PBX по source IP — БЕЗ учётных данных.

Отправляет анонимный SIP REGISTER на PBX и смотрит первую строку ответа.
Kamailio отвечает по-разному, и это однозначный дискриминатор:

    403 IP not in whitelist  -> адрес этого сервера НЕ проходит фильтр
    401 Unauthorized         -> адрес ПРОШЁЛ, PBX просит digest-авторизацию  ✔
    (нет ответа)             -> UDP 5060 не доходит (фаервол/ТСПУ)

Реквизиты PBX в git НЕ хранятся — репозиторий публичный. Взять их можно из
CloudSoftphone (Настройки -> аккаунт -> SIP server / username) и положить рядом
в pbx.env (см. pbx.env.example), либо передать явно.

Запускать НА проверяемом сервере:
    python3 sip-probe.py                          # реквизиты из pbx.env
    python3 sip-probe.py <pbx-host> [sip-user]    # или аргументами
"""
import os
import random
import socket
import string
import sys

TIMEOUT = 5.0
EXPIRES = 300   # ниже Min-Expires многих Kamailio-конфигов ответ будет 423, а не 401
ENV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pbx.env")


def load_env_file() -> None:
    """Подтягивает pbx.env, не перетирая уже заданные переменные окружения."""
    if not os.path.exists(ENV_FILE):
        return
    with open(ENV_FILE, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def rand(n: int) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))


def main() -> int:
    load_env_file()
    host = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("PBX_HOST", "")
    user = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("SIP_USER", "probe")

    if not host:
        print(__doc__.strip())
        print("\nНе задан PBX_HOST: создай pbx.env из pbx.env.example или передай хост аргументом.")
        return 2

    try:
        pbx_ip = socket.gethostbyname(host)
    except OSError as e:
        print(f"DNS не резолвится: {host} ({e})")
        return 2

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(TIMEOUT)
    sock.connect((pbx_ip, 5060))
    local_ip, local_port = sock.getsockname()

    branch, tag, callid = f"z9hG4bK{rand(16)}", rand(32), rand(32)
    register = "\r\n".join([
        f"REGISTER sip:{host} SIP/2.0",
        f"Via: SIP/2.0/UDP {local_ip}:{local_port};branch={branch};rport",
        f"From: <sip:{user}@{host}>;tag={tag}",
        f"To: <sip:{user}@{host}>",
        f"Call-ID: {callid}",
        "CSeq: 1 REGISTER",
        f"Contact: <sip:{user}@{local_ip}:{local_port}>",
        "Max-Forwards: 70",
        f"Expires: {EXPIRES}",
        "User-Agent: sip-probe/1.0",
        "Content-Length: 0",
        "", "",
    ])

    print(f"PBX      : {host} -> {pbx_ip}:5060/udp")
    print(f"Локально : {local_ip}:{local_port}")
    sock.send(register.encode())

    try:
        data, _ = sock.recvfrom(65535)
    except socket.timeout:
        print("\nРЕЗУЛЬТАТ: ОТВЕТА НЕТ — UDP 5060 не доходит (фаервол или ТСПУ).")
        return 3

    first = data.decode(errors="replace").splitlines()[0]
    print(f"\nОтвет PBX: {first}")

    if " 401 " in first or " 407 " in first:
        print("РЕЗУЛЬТАТ: IP ПРОШЁЛ белый список — PBX просит авторизацию. Разворачиваем узел.")
        return 0
    if " 423 " in first:
        # До проверки Expires запрос доходит только с разрешённого адреса:
        # отказ по белому списку отдаётся раньше, чем валидация параметров.
        print("РЕЗУЛЬТАТ: IP ПРОШЁЛ белый список — PBX дошёл до валидации Expires.")
        return 0
    if " 403 " in first:
        print("РЕЗУЛЬТАТ: IP ОТБИТ белым списком. Этот адрес не годится — нужен другой класс IP.")
        return 1
    print("РЕЗУЛЬТАТ: неожиданный код, смотреть полный ответ:")
    print(data.decode(errors="replace"))
    return 4


if __name__ == "__main__":
    sys.exit(main())
