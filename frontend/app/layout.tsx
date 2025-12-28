import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BABLO VPN",
  description: "WireGuard VPN Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preload custom font for faster loading */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/rsperberg/foundation-titles-hand@main/FoundationTitlesHand.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
