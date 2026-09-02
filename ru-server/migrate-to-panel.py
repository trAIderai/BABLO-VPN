#!/usr/bin/env python3
"""
Перенос действующего состояния голого AmneziaWG в формат панели wg-easy.

Зачем: узел изначально поднят без панели (install-exit.sh), клиентам уже
розданы QR и .conf. Панель хранит своё состояние в wg0.json и при первом
запуске сгенерировала бы НОВЫЙ ключ сервера — все выданные профили умерли бы.
Скрипт собирает wg0.json из уже существующих ключей, поэтому раздавать
заново ничего не нужно.

Читает:  /opt/bablo-exit/{server.key,server.pub,obfuscation.env,clients/*.conf}
Пишет:   /tmp/wg0.json   (дальше копируется в том wg-easy-data)

Приватные ключи не печатаются.
"""
import glob
import json
import os
import re
import subprocess
import sys
import uuid
from datetime import datetime, timezone

STATE = "/opt/bablo-exit"
OUT = "/tmp/wg0.json"


def read_env(path):
    env = {}
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip().strip("\"'")
    return env


def field(text, name):
    m = re.search(rf"^{name}\s*=\s*(.+)$", text, re.M)
    return m.group(1).strip() if m else None


def pubkey_of(private):
    r = subprocess.run(["awg", "pubkey"], input=private + "\n",
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"awg pubkey: {r.stderr.strip()}")
    return r.stdout.strip()


def main():
    obf = read_env(f"{STATE}/obfuscation.env")
    node = read_env(f"{STATE}/node.env")
    subnet = node.get("WG_SUBNET", "10.9.0")

    server = {
        "privateKey": open(f"{STATE}/server.key", encoding="utf-8").read().strip(),
        "publicKey": open(f"{STATE}/server.pub", encoding="utf-8").read().strip(),
        "address": f"{subnet}.1",
        "jc": int(obf["JC"]), "jmin": int(obf["JMIN"]), "jmax": int(obf["JMAX"]),
        "s1": int(obf["S1"]), "s2": int(obf["S2"]),
        "h1": int(obf["H1"]), "h2": int(obf["H2"]),
        "h3": int(obf["H3"]), "h4": int(obf["H4"]),
    }

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    clients = {}
    for path in sorted(glob.glob(f"{STATE}/clients/*.conf")):
        name = os.path.splitext(os.path.basename(path))[0]
        text = open(path, encoding="utf-8").read()
        priv = field(text, "PrivateKey")
        psk = field(text, "PresharedKey")
        addr = field(text, "Address")
        if not (priv and psk and addr):
            print(f"  ПРОПУЩЕН {name}: не хватает полей", file=sys.stderr)
            continue
        cid = str(uuid.uuid4())
        clients[cid] = {
            "id": cid,
            "name": name,
            "address": addr.split("/")[0],
            "privateKey": priv,
            "publicKey": pubkey_of(priv),
            "preSharedKey": psk,
            "createdAt": now,
            "updatedAt": now,
            "enabled": True,
        }
        print(f"  перенесён: {name} -> {addr.split('/')[0]}")

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump({"server": server, "clients": clients}, fh, indent=2)
    os.chmod(OUT, 0o600)
    print(f"\nЗаписан {OUT}: клиентов {len(clients)}, ключ сервера сохранён прежний.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
