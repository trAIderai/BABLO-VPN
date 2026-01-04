"use client";

import {
  LogoB,
  LogoBV,
  LogoDot,
  LogoKey,
  LogoBolt,
  LogoShield,
  LogoLock,
  LogoBrackets,
} from "../components/logos";

export default function LogoPreview() {
  const logos = [
    { name: "1. B", Component: LogoB },
    { name: "2. BV", Component: LogoBV },
    { name: "3. Dot", Component: LogoDot },
    { name: "4. Key", Component: LogoKey },
    { name: "5. Bolt", Component: LogoBolt },
    { name: "6. Shield", Component: LogoShield },
    { name: "7. Lock", Component: LogoLock },
    { name: "8. Brackets", Component: LogoBrackets },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08090B",
      padding: "40px 20px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <h1 style={{
        color: "#F0B90B",
        fontSize: "24px",
        textAlign: "center",
        marginBottom: "40px",
      }}>
        Выбери логотип
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
        {logos.map(({ name, Component }) => (
          <div key={name} style={{ textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 8px",
            }}>
              <Component size={64} />
            </div>
            <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{name}</span>
          </div>
        ))}
      </div>

      <p style={{
        color: "#6B7280",
        textAlign: "center",
        marginTop: "40px",
        fontSize: "14px",
      }}>
        Напиши номер (1-8)
      </p>
    </div>
  );
}
