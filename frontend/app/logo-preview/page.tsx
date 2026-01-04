"use client";

import {
  LogoNetwork,
  LogoTunnel,
  LogoCrypto,
  LogoShieldFlow,
  LogoMinimalB,
  LogoInfinity,
} from "../components/logos";

export default function LogoPreview() {
  const logos = [
    { name: "Network B", description: "Геометрическая B с узлами сети", Component: LogoNetwork },
    { name: "Tunnel", description: "VPN туннель / портал", Component: LogoTunnel },
    { name: "Crypto Lock", description: "Крипто-стиль замок в гексагоне", Component: LogoCrypto },
    { name: "Shield Flow", description: "Динамичный щит с потоком данных", Component: LogoShieldFlow },
    { name: "Minimal B", description: "Минималистичная B", Component: LogoMinimalB },
    { name: "Infinity", description: "Бесконечная защита", Component: LogoInfinity },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08090B",
      padding: "40px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <h1 style={{
        color: "#F0B90B",
        fontSize: "32px",
        textAlign: "center",
        marginBottom: "48px",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}>
        BABLO VPN — Выбери логотип
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {logos.map(({ name, description, Component }) => (
          <div
            key={name}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(240, 185, 11, 0.2)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(240, 185, 11, 0.5)";
              e.currentTarget.style.background = "rgba(240, 185, 11, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(240, 185, 11, 0.2)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            {/* Logo display */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(240, 185, 11, 0.15) 0%, rgba(240, 185, 11, 0.05) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Component size={48} />
              </div>
            </div>

            {/* Name */}
            <h3 style={{
              color: "#E5E7EB",
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "8px",
            }}>
              {name}
            </h3>

            {/* Description */}
            <p style={{
              color: "#6B7280",
              fontSize: "14px",
              marginBottom: "20px",
            }}>
              {description}
            </p>

            {/* Preview in header context */}
            <div style={{
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Component size={24} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  color: "#F0B90B",
                  fontSize: "16px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}>
                  BABLO VPN
                </div>
                <div style={{
                  color: "#6B7280",
                  fontSize: "12px",
                }}>
                  WireGuard Clients
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{
        color: "#6B7280",
        textAlign: "center",
        marginTop: "48px",
        fontSize: "14px",
      }}>
        Напиши номер или название логотипа который нравится
      </p>
    </div>
  );
}
