"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Shield,
  Plus,
  Trash2,
  Download,
  QrCode,
  Power,
  Loader2,
  Wifi,
  Copy,
  Check,
  X,
  RefreshCw,
  Users,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Play,
  Pause,
  Eye,
  EyeOff,
  Zap,
  FileJson,
  ExternalLink,
  Smartphone,
  Monitor,
  Apple,
} from "lucide-react";
import QRCode from "qrcode";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        theme?: string;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface Client {
  id: string;
  name: string;
  enabled: boolean;
  address: string;
  publicKey: string;
  createdAt: string;
  updatedAt: string;
  downloadableConfig: boolean;
  persistentKeepalive: string;
  latestHandshakeAt: string | null;
  transferRx: number;
  transferTx: number;
  protectionType?: 'standard' | 'advanced';
}

type ProtectionType = 'standard' | 'advanced';

interface Session {
  authenticated: boolean;
  requiresPassword: boolean;
}

// Protocol descriptions for user guidance
const PROTOCOL_INFO: Record<string, { icon: string; tip: string; color: string }> = {
  'VLESS Reality': {
    icon: '⚡',
    tip: 'Основной протокол. Быстрый, обходит DPI.',
    color: '#F0B90B',
  },
  'Trojan Reality': {
    icon: '🛡️',
    tip: 'Резерв если VLESS заблокирован.',
    color: '#3B82F6',
  },
  'Hysteria2': {
    icon: '🚀',
    tip: 'Для плохих сетей: метро, мобильный.',
    color: '#10B981',
  },
};

// Multi Protocol Modal Component
const MultiProtocolModal = ({
  client,
  protocols,
  setProtocols,
  copiedProtocol,
  setCopiedProtocol,
  onClose,
  onDownloadSingBox,
}: {
  client: Client;
  protocols: Array<{name: string; url: string | null; configured: boolean; description: string}>;
  setProtocols: React.Dispatch<React.SetStateAction<Array<{name: string; url: string | null; configured: boolean; description: string}>>>;
  copiedProtocol: string | null;
  setCopiedProtocol: React.Dispatch<React.SetStateAction<string | null>>;
  onClose: () => void;
  onDownloadSingBox: () => void;
}) => {
  const [loadingProtocols, setLoadingProtocols] = useState(true);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const res = await fetch('/api/multi-config');
        const data = await res.json();
        if (data.protocols) {
          setProtocols(data.protocols);
        }
      } catch (e) {
        console.error('Failed to load protocols:', e);
      } finally {
        setLoadingProtocols(false);
      }
    };
    fetchProtocols();
  }, [setProtocols]);

  const copyProtocolUrl = async (protocol: {name: string; url: string | null}) => {
    if (!protocol.url) return;
    try {
      await navigator.clipboard.writeText(protocol.url);
      setCopiedProtocol(protocol.name);
      setTimeout(() => setCopiedProtocol(null), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={onClose}>
      <div className="card animate-fadeIn modal-content" style={{ padding: "24px", width: "100%", maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileJson style={{ width: "18px", height: "18px", color: "#F0B90B" }} />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Выберите протокол</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: "20px", height: "20px", color: "#6B7280" }} />
          </button>
        </div>

        <div style={{ background: "rgba(107, 114, 128, 0.1)", borderRadius: "12px", padding: "14px", marginBottom: "20px", border: "1px solid rgba(107, 114, 128, 0.2)" }}>
          <p style={{ color: "#9CA3AF", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
            Скопируйте ссылку нужного протокола и вставьте в NekoBox через «Программа» → «Добавить профиль из буфера» (Ctrl+V)
          </p>
        </div>

        {/* Protocol List */}
        <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
          {loadingProtocols ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: "#F0B90B", margin: "0 auto" }} />
            </div>
          ) : protocols.map((protocol) => {
            const info = PROTOCOL_INFO[protocol.name] || { icon: '🔒', tip: protocol.description, color: '#6B7280' };
            const isCopied = copiedProtocol === protocol.name;

            return (
              <div
                key={protocol.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: protocol.configured ? `1px solid ${info.color}33` : "1px solid rgba(107, 114, 128, 0.2)",
                  background: protocol.configured ? `${info.color}08` : "rgba(107, 114, 128, 0.05)",
                  opacity: protocol.configured ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: "20px" }}>{info.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 500, color: protocol.configured ? "#E5E7EB" : "#6B7280" }}>{protocol.name}</span>
                    {!protocol.configured && (
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(107, 114, 128, 0.2)", color: "#6B7280" }}>
                        Не настроен
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0", lineHeight: "1.4" }}>
                    {info.tip}
                  </p>
                </div>
                {protocol.configured && protocol.url && (
                  <button
                    onClick={() => copyProtocolUrl(protocol)}
                    className="btn-secondary"
                    style={{
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: isCopied ? "rgba(16, 185, 129, 0.15)" : `${info.color}15`,
                      borderColor: isCopied ? "rgba(16, 185, 129, 0.4)" : `${info.color}40`,
                      flexShrink: 0,
                    }}
                  >
                    {isCopied ? (
                      <>
                        <Check style={{ width: "14px", height: "14px", color: "#10B981" }} />
                        <span style={{ color: "#10B981", fontSize: "13px" }}>OK</span>
                      </>
                    ) : (
                      <>
                        <Copy style={{ width: "14px", height: "14px", color: info.color }} />
                        <span style={{ color: info.color, fontSize: "13px" }}>Копировать</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* App Download Links */}
        <details style={{ marginBottom: "20px" }}>
          <summary style={{ fontSize: "14px", color: "#9CA3AF", cursor: "pointer", marginBottom: "12px", userSelect: "none" }}>
            📱 Где скачать клиент?
          </summary>
          <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
            <a href="https://github.com/MatsuriDayo/nekoray/releases" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", textDecoration: "none" }} className="download-link">
              <Monitor style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              <span style={{ flex: 1, color: "#9CA3AF", fontSize: "13px" }}>NekoBox (Windows/Linux)</span>
              <ExternalLink style={{ width: "14px", height: "14px", color: "#6B7280" }} />
            </a>
            <a href="https://apps.apple.com/app/sing-box/id6451272673" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", textDecoration: "none" }} className="download-link">
              <Apple style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              <span style={{ flex: 1, color: "#9CA3AF", fontSize: "13px" }}>SingBox (macOS/iOS)</span>
              <ExternalLink style={{ width: "14px", height: "14px", color: "#6B7280" }} />
            </a>
            <a href="https://play.google.com/store/apps/details?id=moe.nb4a" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", textDecoration: "none" }} className="download-link">
              <Smartphone style={{ width: "18px", height: "18px", color: "#6B7280" }} />
              <span style={{ flex: 1, color: "#9CA3AF", fontSize: "13px" }}>NekoBox (Android)</span>
              <ExternalLink style={{ width: "14px", height: "14px", color: "#6B7280" }} />
            </a>
          </div>
        </details>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Закрыть
          </button>
          <button onClick={onDownloadSingBox} className="btn-gold" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Download style={{ width: "16px", height: "16px" }} />
            JSON (SingBox)
          </button>
        </div>
      </div>
    </div>
  );
};

// Social Links Component
const SocialLinks = () => (
  <div className="social-links">
    <a href="https://www.youtube.com/@EverydayTraderX" target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    </a>
    <a href="https://t.me/EverydayTraderX" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram Channel">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
    </a>
    <a href="https://t.me/everydaytradertalks" target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram Chat">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
    </a>
  </div>
);

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [protectionType, setProtectionType] = useState<ProtectionType>('standard');
  const [adding, setAdding] = useState(false);
  const [qrModal, setQrModal] = useState<{ client: Client; qr: string } | null>(null);
  const [multiModal, setMultiModal] = useState<Client | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Array<{name: string; url: string | null; configured: boolean; description: string}>>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [togglingAll, setTogglingAll] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Turnstile state
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Load Turnstile config and script
  useEffect(() => {
    const loadTurnstile = async () => {
      try {
        const res = await fetch("/api/config");
        const config = await res.json();
        if (config.turnstileSiteKey) {
          setTurnstileSiteKey(config.turnstileSiteKey);
          // Load Turnstile script
          if (!document.getElementById("turnstile-script")) {
            const script = document.createElement("script");
            script.id = "turnstile-script";
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            document.head.appendChild(script);
          }
        }
      } catch (e) {
        console.error("Failed to load config:", e);
      }
    };
    loadTurnstile();
  }, []);

  // Render Turnstile widget when ready
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current || session?.authenticated) return;
    
    const renderWidget = () => {
      if (window.turnstile && turnstileContainerRef.current && !turnstileWidgetId.current) {
        turnstileWidgetId.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setTurnstileToken(token),
          theme: "dark",
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [turnstileSiteKey, session]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data);
      if (data.authenticated) {
        loadClients();
      } else {
        setLoading(false);
      }
    } catch (e) {
      setError("Failed to check session");
      setLoading(false);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the CAPTCHA");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, turnstileToken }),
      });
      if (res.ok) {
        setSession({ authenticated: true, requiresPassword: true });
        loadClients();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Wrong password");
        setLoading(false);
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current);
          setTurnstileToken(null);
        }
      }
    } catch (e) {
      setError("Login failed");
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch("/api/wireguard/client");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error("Failed to load clients:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setAdding(true);
    try {
      // Add [PRO] suffix for advanced protection
      const clientName = protectionType === 'advanced'
        ? `${newClientName.trim()} [PRO]`
        : newClientName.trim();

      // Create WireGuard client
      const res = await fetch("/api/wireguard/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName }),
      });

      if (res.ok) {
        // If advanced protection, also create VLESS client
        if (protectionType === 'advanced') {
          try {
            await fetch("/api/xray", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                inboundId: 1,
                email: clientName,
                uuid: crypto.randomUUID(),
              }),
            });
          } catch (xrayError) {
            console.error("Failed to create VLESS client:", xrayError);
          }
        }

        setNewClientName("");
        setProtectionType('standard');
        setShowAddModal(false);
        loadClients();
      }
    } catch (e) {
      console.error("Failed to add client:", e);
    } finally {
      setAdding(false);
    }
  };

  const deleteClient = async (client: Client) => {
    if (!confirm(`Delete "${client.name}"?`)) return;
    try {
      await fetch("/api/wireguard/client/" + client.id, { method: "DELETE" });
      loadClients();
    } catch (e) {
      console.error("Failed to delete client:", e);
    }
  };

  const toggleClient = async (client: Client) => {
    try {
      await fetch("/api/wireguard/client/" + client.id + "/" + (client.enabled ? "disable" : "enable"), {
        method: "POST",
      });
      loadClients();
    } catch (e) {
      console.error("Failed to toggle client:", e);
    }
  };

  const toggleAllClients = async () => {
    const enabledClients = clients.filter(c => c.enabled);
    const allEnabled = enabledClients.length === clients.length;

    setTogglingAll(true);
    try {
      await Promise.all(
        clients.map(client =>
          fetch("/api/wireguard/client/" + client.id + "/" + (allEnabled ? "disable" : "enable"), {
            method: "POST",
          })
        )
      );
      await loadClients();
    } catch (e) {
      console.error("Failed to toggle all clients:", e);
    } finally {
      setTogglingAll(false);
    }
  };

  const downloadConfig = async (client: Client) => {
    try {
      const res = await fetch("/api/wireguard/client/" + client.id + "/configuration");
      const config = await res.text();
      const blob = new Blob([config], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = client.name + ".conf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download config:", e);
    }
  };

  const showQR = async (client: Client) => {
    try {
      const res = await fetch("/api/wireguard/client/" + client.id + "/configuration");
      const config = await res.text();
      const qr = await QRCode.toDataURL(config, { width: 300, margin: 2 });
      setQrModal({ client, qr });
    } catch (e) {
      console.error("Failed to generate QR:", e);
    }
  };

  const copyConfig = async (client: Client) => {
    try {
      const res = await fetch("/api/wireguard/client/" + client.id + "/configuration");
      const config = await res.text();
      await navigator.clipboard.writeText(config);
      setCopiedId(client.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Failed to copy config:", e);
    }
  };

  const downloadSingBoxConfig = async (client: Client) => {
    try {
      const res = await fetch("/api/singbox/" + client.id);
      const config = await res.text();
      const blob = new Blob([config], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = client.name + "-singbox.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download SingBox config:", e);
    }
  };

  const isAdvancedClient = (client: Client) => {
    // Check if client name ends with [PRO] or has advanced marker
    return client.name.includes('[PRO]') || client.protectionType === 'advanced';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isOnline = (client: Client) => {
    if (!client.latestHandshakeAt) return false;
    const lastHandshake = new Date(client.latestHandshakeAt).getTime();
    const now = Date.now();
    return now - lastHandshake < 3 * 60 * 1000;
  };

  if (showSplash) {
    return (
      <div className="splash-container" style={{ position: "fixed", inset: 0, background: "#08090B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100, overflow: "hidden" }}>
        <div className="splash-logo" style={{ position: "absolute", inset: 0 }}>
          <Image src="/splash-bg.png" alt="BABLO" fill style={{ objectFit: "cover" }} priority />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 30%, rgba(8, 9, 11, 0.7) 70%)" }} />
        <div className="splash-text" style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: "60vh", opacity: 0 }}>
          <h1 className="font-bablo splash-title" style={{ fontSize: "4rem", color: "#F0B90B", letterSpacing: "0.15em", textShadow: "0 0 60px rgba(240, 185, 11, 0.6)", margin: 0 }}>BABLO VPN</h1>
          <p style={{ color: "#6B7280", marginTop: "12px", fontSize: "14px", letterSpacing: "0.3em" }}>WIREGUARD MANAGEMENT</p>
        </div>
        <div className="splash-shimmer" style={{ position: "absolute", bottom: "80px", width: "200px", height: "2px", borderRadius: "2px", zIndex: 10 }} />
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div className="card animate-fadeIn login-card" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Shield style={{ width: "32px", height: "32px", color: "#F0B90B" }} />
            </div>
            <h1 className="font-bablo" style={{ fontSize: "28px", fontWeight: 600, margin: 0, color: "#F0B90B", letterSpacing: "0.05em" }}>BABLO VPN</h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>WireGuard Management</p>
          </div>
          <form onSubmit={login}>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "48px" }} autoFocus />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                {showPassword ? <EyeOff style={{ width: "20px", height: "20px", color: "#6B7280" }} /> : <Eye style={{ width: "20px", height: "20px", color: "#6B7280" }} />}
              </button>
            </div>
            {turnstileSiteKey && (
              <div ref={turnstileContainerRef} style={{ marginTop: "16px", display: "flex", justifyContent: "center" }} />
            )}
            {error && <p style={{ color: "#EF4444", fontSize: "14px", marginTop: "12px", textAlign: "center" }}>{error}</p>}
            <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: "16px" }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" style={{ width: "20px", height: "20px" }} /> : "Login"}
            </button>
          </form>
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "#6B7280", fontSize: "12px", textAlign: "center", marginBottom: "16px" }}>Follow EverydayTrader</p>
            <SocialLinks />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: "40px", height: "40px", color: "#F0B90B" }} />
      </div>
    );
  }

  const onlineCount = clients.filter(isOnline).length;
  const enabledCount = clients.filter(c => c.enabled).length;
  const allEnabled = enabledCount === clients.length && clients.length > 0;

  return (
    <div className="main-container" style={{ minHeight: "100vh", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Background logo */}
      <div className="bg-logo" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "180vw", height: "180vh", opacity: 0.12, pointerEvents: "none", zIndex: 0 }}>
        <Image src="/splash-bg.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ width: "24px", height: "24px", color: "#F0B90B" }} />
            </div>
            <div>
              <h1 className="font-bablo" style={{ fontSize: "22px", fontWeight: 600, margin: 0, color: "#F0B90B", letterSpacing: "0.05em" }}>BABLO VPN</h1>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>WireGuard Clients</p>
            </div>
          </div>
          <div className="header-actions" style={{ display: "flex", gap: "12px" }}>
            {clients.length > 0 && (
              <button
                onClick={toggleAllClients}
                className="btn-secondary"
                style={{
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: allEnabled ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)",
                  borderColor: allEnabled ? "rgba(16, 185, 129, 0.3)" : "rgba(107, 114, 128, 0.3)"
                }}
                disabled={togglingAll}
                title={allEnabled ? "Stop All" : "Start All"}
              >
                {togglingAll ? (
                  <Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} />
                ) : allEnabled ? (
                  <Pause style={{ width: "18px", height: "18px", color: "#10B981" }} />
                ) : (
                  <Play style={{ width: "18px", height: "18px", color: "#6B7280" }} />
                )}
              </button>
            )}
            <button onClick={handleRefresh} className="btn-secondary" style={{ padding: "10px 16px" }} disabled={refreshing}>
              <RefreshCw style={{ width: "18px", height: "18px" }} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus style={{ width: "18px", height: "18px" }} />
              Добавить
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Users className="stat-icon" style={{ width: "20px", height: "20px", color: "#F0B90B", flexShrink: 0 }} />
              <div>
                <p className="stat-label" style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Total Clients</p>
                <p className="stat-value" style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>{clients.length}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Activity className="stat-icon" style={{ width: "20px", height: "20px", color: "#10B981", flexShrink: 0 }} />
              <div>
                <p className="stat-label" style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Online Now</p>
                <p className="stat-value" style={{ fontSize: "24px", fontWeight: 600, margin: 0, color: "#10B981" }}>{onlineCount}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ArrowDownToLine className="stat-icon" style={{ width: "20px", height: "20px", color: "#3B82F6", flexShrink: 0 }} />
              <div>
                <p className="stat-label" style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Total Traffic</p>
                <p className="stat-value" style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>{formatBytes(clients.reduce((sum, c) => sum + c.transferRx + c.transferTx, 0))}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="clients-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {clients.map((client) => (
            <div key={client.id} className="card animate-fadeIn" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 }} className={isOnline(client) ? "status-online" : "status-offline"} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{client.name.replace(' [PRO]', '')}</h3>
                      {isAdvancedClient(client) && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "6px", background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)", fontSize: "10px", fontWeight: 600, color: "#F0B90B", textTransform: "uppercase" }}>
                          <Zap style={{ width: "10px", height: "10px" }} />
                          PRO
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#6B7280", fontSize: "12px", margin: "4px 0 0" }}>{client.address}</p>
                  </div>
                </div>
                <button onClick={() => toggleClient(client)} style={{ padding: "6px", borderRadius: "8px", border: "none", background: client.enabled ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)", cursor: "pointer" }}>
                  <Power style={{ width: "16px", height: "16px", color: client.enabled ? "#10B981" : "#6B7280" }} />
                </button>
              </div>
              <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ArrowDownToLine style={{ width: "14px", height: "14px", color: "#10B981" }} />
                  <span style={{ color: "#9CA3AF" }}>{formatBytes(client.transferRx)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ArrowUpFromLine style={{ width: "14px", height: "14px", color: "#3B82F6" }} />
                  <span style={{ color: "#9CA3AF" }}>{formatBytes(client.transferTx)}</span>
                </div>
              </div>
              <div className="client-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => downloadConfig(client)} className="btn-secondary" style={{ flex: 1, minWidth: "80px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px" }}>
                  <Download style={{ width: "14px", height: "14px" }} />
                  WG
                </button>
                {isAdvancedClient(client) && (
                  <button onClick={() => setMultiModal(client)} className="btn-secondary" style={{ flex: 1, minWidth: "80px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", background: "rgba(240, 185, 11, 0.1)", borderColor: "rgba(240, 185, 11, 0.3)" }}>
                    <FileJson style={{ width: "14px", height: "14px", color: "#F0B90B" }} />
                    <span style={{ color: "#F0B90B" }}>Multi</span>
                  </button>
                )}
                <button onClick={() => showQR(client)} className="btn-secondary" style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode style={{ width: "14px", height: "14px" }} />
                </button>
                <button onClick={() => copyConfig(client)} className="btn-secondary" style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {copiedId === client.id ? <Check style={{ width: "14px", height: "14px", color: "#10B981" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                </button>
                <button onClick={() => deleteClient(client)} className="btn-secondary" style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 style={{ width: "14px", height: "14px", color: "#EF4444" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="card" style={{ padding: "60px", textAlign: "center" }}>
            <Wifi style={{ width: "48px", height: "48px", color: "#6B7280", margin: "0 auto 16px" }} />
            <p style={{ color: "#6B7280", fontSize: "16px" }}>No VPN clients yet</p>
            <button onClick={() => setShowAddModal(true)} className="btn-gold" style={{ marginTop: "16px" }}>Add First Client</button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowAddModal(false)}>
          <div className="card animate-fadeIn modal-content" style={{ padding: "24px", width: "100%", maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Новый клиент</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <X style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              </button>
            </div>
            <form onSubmit={addClient}>
              <input type="text" className="input" placeholder="Имя (например iPhone, MacBook)" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} autoFocus />

              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "12px" }}>Тип защиты:</p>

                <label style={{ display: "block", padding: "14px 16px", borderRadius: "12px", border: protectionType === 'standard' ? "2px solid #F0B90B" : "1px solid rgba(255,255,255,0.1)", background: protectionType === 'standard' ? "rgba(240, 185, 11, 0.1)" : "transparent", cursor: "pointer", marginBottom: "10px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input type="radio" name="protectionType" checked={protectionType === 'standard'} onChange={() => setProtectionType('standard')} style={{ accentColor: "#F0B90B" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "15px" }}>Стандартная защита</div>
                      <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>Быстрое и стабильное соединение</div>
                    </div>
                  </div>
                </label>

                <label style={{ display: "block", padding: "14px 16px", borderRadius: "12px", border: protectionType === 'advanced' ? "2px solid #F0B90B" : "1px solid rgba(255,255,255,0.1)", background: protectionType === 'advanced' ? "rgba(240, 185, 11, 0.1)" : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input type="radio" name="protectionType" checked={protectionType === 'advanced'} onChange={() => setProtectionType('advanced')} style={{ accentColor: "#F0B90B" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "15px" }}>Продвинутая защита</div>
                      <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>Обход блокировок + резервные протоколы</div>
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }} disabled={adding || !newClientName.trim()}>
                  {adding ? <Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} /> : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="footer" style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "24px", fontSize: "12px", color: "#4B5563", zIndex: 1 }}>
        <span>Powered by <a href="https://github.com/wg-easy/wg-easy" target="_blank" rel="noopener noreferrer" style={{ color: "#6B7280", textDecoration: "none" }}>wg-easy</a></span>
        <SocialLinks />
      </div>

      {qrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setQrModal(null)}>
          <div className="card animate-fadeIn modal-content" style={{ padding: "24px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>{qrModal.client.name}</h2>
            <img src={qrModal.qr} alt="QR Code" style={{ borderRadius: "12px", maxWidth: "100%" }} />
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "16px" }}>Scan with WireGuard app</p>
            <button onClick={() => setQrModal(null)} className="btn-secondary" style={{ marginTop: "16px" }}>Close</button>
          </div>
        </div>
      )}

      {multiModal && (
        <MultiProtocolModal
          client={multiModal}
          protocols={protocols}
          setProtocols={setProtocols}
          copiedProtocol={copiedProtocol}
          setCopiedProtocol={setCopiedProtocol}
          onClose={() => setMultiModal(null)}
          onDownloadSingBox={() => { downloadSingBoxConfig(multiModal); setMultiModal(null); }}
        />
      )}
    </div>
  );
}
