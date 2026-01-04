"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ChevronLeft,
  Monitor,
  Apple,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Settings,
  Play,
  Check,
  FileJson,
  Import,
  FolderOpen,
} from "lucide-react";

type Platform = "windows" | "macos" | "ios" | "android" | null;

export default function GuidePage() {
  const [expandedPlatform, setExpandedPlatform] = useState<Platform>(null);

  const togglePlatform = (platform: Platform) => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1F2228", padding: "24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#6B7280",
              textDecoration: "none",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
            Назад к клиентам
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileJson style={{ width: "24px", height: "24px", color: "#F0B90B" }} />
            </div>
            <div>
              <h1
                className="font-bablo"
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  margin: 0,
                  color: "#F0B90B",
                  letterSpacing: "0.05em",
                }}
              >
                Инструкции
              </h1>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>
                Настройка Multi-протокол конфига
              </p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div
          className="card"
          style={{
            padding: "20px",
            marginBottom: "24px",
            background: "rgba(240, 185, 11, 0.05)",
            border: "1px solid rgba(240, 185, 11, 0.2)",
            borderRadius: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: "#F0B90B" }}>
            Что такое Multi-протокол конфиг?
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
            Это специальный файл конфигурации в формате JSON, который содержит настройки для
            нескольких VPN-протоколов одновременно (WireGuard + VLESS). Приложение автоматически
            выбирает лучший доступный протокол для стабильного соединения и обхода блокировок.
          </p>
        </div>

        {/* Platform guides */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Windows/Linux - NekoBox */}
          <div
            className="card"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: expandedPlatform === "windows" ? "1px solid rgba(240, 185, 11, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => togglePlatform("windows")}
              style={{
                width: "100%",
                padding: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(59, 130, 246, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Monitor style={{ width: "22px", height: "22px", color: "#3B82F6" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: "#E5E7EB", fontSize: "16px" }}>
                    Windows / Linux
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>NekoBox (nekoray)</div>
                </div>
              </div>
              {expandedPlatform === "windows" ? (
                <ChevronUp style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              ) : (
                <ChevronDown style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              )}
            </button>

            {expandedPlatform === "windows" && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ paddingTop: "20px" }}>
                  {/* Download link */}
                  <a
                    href="https://github.com/MatsuriDayo/nekoray/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      background: "rgba(59, 130, 246, 0.1)",
                      textDecoration: "none",
                      marginBottom: "20px",
                    }}
                  >
                    <Download style={{ width: "20px", height: "20px", color: "#3B82F6" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: "#E5E7EB" }}>Скачать NekoBox</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>
                        GitHub Releases → nekoray-*-windows64.zip
                      </div>
                    </div>
                    <ExternalLink style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </a>

                  {/* Steps */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Step
                      number={1}
                      title="Установка"
                      description="Скачайте архив nekoray-*-windows64.zip и распакуйте в удобную папку (например C:\Program Files\NekoBox). Запустите nekoray.exe"
                    />
                    <Step
                      number={2}
                      title="Импорт конфига"
                      description='В главном окне нажмите "Программа" → "Добавить профиль из буфера обмена" или используйте Ctrl+V. Также можно перетащить JSON файл прямо в окно программы.'
                    />
                    <Step
                      number={3}
                      title="Выбор профиля"
                      description="В списке профилей появится новый пункт. Кликните по нему правой кнопкой и выберите «Запустить» или просто дважды кликните."
                    />
                    <Step
                      number={4}
                      title="Подключение"
                      description='Нажмите кнопку "Запустить" в нижней панели. Иконка в трее станет зелёной когда соединение установлено.'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* macOS - SingBox */}
          <div
            className="card"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: expandedPlatform === "macos" ? "1px solid rgba(240, 185, 11, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => togglePlatform("macos")}
              style={{
                width: "100%",
                padding: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(156, 163, 175, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Apple style={{ width: "22px", height: "22px", color: "#9CA3AF" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: "#E5E7EB", fontSize: "16px" }}>macOS</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>SingBox</div>
                </div>
              </div>
              {expandedPlatform === "macos" ? (
                <ChevronUp style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              ) : (
                <ChevronDown style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              )}
            </button>

            {expandedPlatform === "macos" && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ paddingTop: "20px" }}>
                  <a
                    href="https://apps.apple.com/app/sing-box/id6451272673"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(156, 163, 175, 0.3)",
                      background: "rgba(156, 163, 175, 0.1)",
                      textDecoration: "none",
                      marginBottom: "20px",
                    }}
                  >
                    <Apple style={{ width: "20px", height: "20px", color: "#9CA3AF" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: "#E5E7EB" }}>Скачать из App Store</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>SingBox - официальный клиент</div>
                    </div>
                    <ExternalLink style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </a>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Step
                      number={1}
                      title="Установка"
                      description="Установите SingBox из App Store. Приложение бесплатное."
                    />
                    <Step
                      number={2}
                      title="Импорт конфига"
                      description='Откройте приложение. Перейдите на вкладку "Profiles" и нажмите "+" в правом верхнем углу. Выберите "Import" и укажите скачанный JSON файл.'
                    />
                    <Step
                      number={3}
                      title="Активация профиля"
                      description='Нажмите на импортированный профиль, чтобы сделать его активным. Он будет отмечен галочкой.'
                    />
                    <Step
                      number={4}
                      title="Подключение"
                      description='Перейдите на вкладку "Dashboard" и нажмите большую кнопку включения. При первом запуске разрешите создание VPN-подключения.'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* iOS - SingBox */}
          <div
            className="card"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: expandedPlatform === "ios" ? "1px solid rgba(240, 185, 11, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => togglePlatform("ios")}
              style={{
                width: "100%",
                padding: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(236, 72, 153, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Smartphone style={{ width: "22px", height: "22px", color: "#EC4899" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: "#E5E7EB", fontSize: "16px" }}>
                    iPhone / iPad
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>SingBox</div>
                </div>
              </div>
              {expandedPlatform === "ios" ? (
                <ChevronUp style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              ) : (
                <ChevronDown style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              )}
            </button>

            {expandedPlatform === "ios" && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ paddingTop: "20px" }}>
                  <a
                    href="https://apps.apple.com/app/sing-box/id6451272673"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(236, 72, 153, 0.3)",
                      background: "rgba(236, 72, 153, 0.1)",
                      textDecoration: "none",
                      marginBottom: "20px",
                    }}
                  >
                    <Apple style={{ width: "20px", height: "20px", color: "#EC4899" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: "#E5E7EB" }}>Скачать из App Store</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>SingBox для iOS</div>
                    </div>
                    <ExternalLink style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </a>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Step
                      number={1}
                      title="Установка"
                      description="Установите SingBox из App Store на ваш iPhone или iPad."
                    />
                    <Step
                      number={2}
                      title="Скачивание конфига"
                      description='На этом сайте нажмите "Скачать конфиг" в модальном окне. Файл сохранится в папку "Загрузки" или откроется диалог выбора приложения.'
                    />
                    <Step
                      number={3}
                      title="Импорт"
                      description='Если файл скачался - откройте приложение "Файлы", найдите JSON и нажмите "Поделиться" → SingBox. Или в SingBox: Profiles → + → Import from File.'
                    />
                    <Step
                      number={4}
                      title="Подключение"
                      description='На главном экране SingBox нажмите кнопку включения. Разрешите добавление VPN-конфигурации когда iOS запросит.'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android - NekoBox */}
          <div
            className="card"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: expandedPlatform === "android" ? "1px solid rgba(240, 185, 11, 0.3)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => togglePlatform("android")}
              style={{
                width: "100%",
                padding: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Smartphone style={{ width: "22px", height: "22px", color: "#10B981" }} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: "#E5E7EB", fontSize: "16px" }}>Android</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>NekoBox</div>
                </div>
              </div>
              {expandedPlatform === "android" ? (
                <ChevronUp style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              ) : (
                <ChevronDown style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              )}
            </button>

            {expandedPlatform === "android" && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ paddingTop: "20px" }}>
                  <a
                    href="https://play.google.com/store/apps/details?id=moe.nb4a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.1)",
                      textDecoration: "none",
                      marginBottom: "20px",
                    }}
                  >
                    <Play style={{ width: "20px", height: "20px", color: "#10B981" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: "#E5E7EB" }}>Скачать из Google Play</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>NekoBox для Android</div>
                    </div>
                    <ExternalLink style={{ width: "16px", height: "16px", color: "#6B7280" }} />
                  </a>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Step
                      number={1}
                      title="Установка"
                      description="Установите NekoBox из Google Play или скачайте APK с GitHub (github.com/MatsuriDayo/NekoBoxForAndroid)."
                    />
                    <Step
                      number={2}
                      title="Скачивание конфига"
                      description='Скачайте JSON файл конфигурации с этого сайта. Он сохранится в папку "Загрузки".'
                    />
                    <Step
                      number={3}
                      title="Импорт"
                      description='Откройте NekoBox. Нажмите "+" в правом нижнем углу → "Импорт из файла" и выберите скачанный JSON файл.'
                    />
                    <Step
                      number={4}
                      title="Подключение"
                      description="Нажмите на добавленный профиль чтобы выбрать его, затем нажмите большую кнопку внизу для подключения. Разрешите создание VPN."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div
          className="card"
          style={{
            padding: "20px",
            marginTop: "24px",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 16px", color: "#E5E7EB" }}>
            Полезные советы
          </h3>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 20px",
              color: "#9CA3AF",
              fontSize: "14px",
              lineHeight: "1.8",
            }}
          >
            <li>
              При проблемах с подключением попробуйте переключиться на другой протокол в настройках
              профиля
            </li>
            <li>
              Если WireGuard заблокирован, приложение автоматически использует VLESS для обхода
              блокировки
            </li>
            <li>Для максимальной скорости используйте WireGuard когда он доступен</li>
            <li>Сохраните JSON файл — его можно импортировать на другие устройства</li>
          </ul>
        </div>

        {/* Back button */}
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link
            href="/"
            className="btn-gold"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              textDecoration: "none",
            }}
          >
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
            Вернуться к клиентам
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div style={{ display: "flex", gap: "14px" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "rgba(240, 185, 11, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "13px",
          fontWeight: 600,
          color: "#F0B90B",
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 500, color: "#E5E7EB", marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.5" }}>{description}</div>
      </div>
    </div>
  );
}
