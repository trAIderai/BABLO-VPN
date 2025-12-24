"use client";

import { useState, useEffect, useCallback } from "react";
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
  WifiOff,
  Copy,
  Check,
  X,
  RefreshCw,
  Users,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import QRCode from "qrcode";

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
}

interface Session {
  authenticated: boolean;
  requiresPassword: boolean;
}

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [adding, setAdding] = useState(false);
  const [qrModal, setQrModal] = useState<{ client: Client; qr: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Hide splash after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Check session
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
    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setSession({ authenticated: true, requiresPassword: true });
        loadClients();
      } else {
        setError("Wrong password");
        setLoading(false);
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
    }
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/wireguard/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      if (res.ok) {
        setNewClientName("");
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
      await fetch(`/api/wireguard/client/${client.id}`, { method: "DELETE" });
      loadClients();
    } catch (e) {
      console.error("Failed to delete client:", e);
    }
  };

  const toggleClient = async (client: Client) => {
    try {
      await fetch(`/api/wireguard/client/${client.id}/${client.enabled ? "disable" : "enable"}`, {
        method: "POST",
      });
      loadClients();
    } catch (e) {
      console.error("Failed to toggle client:", e);
    }
  };

  const downloadConfig = async (client: Client) => {
    try {
      const res = await fetch(`/api/wireguard/client/${client.id}/configuration`);
      const config = await res.text();
      const blob = new Blob([config], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${client.name}.conf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download config:", e);
    }
  };

  const showQR = async (client: Client) => {
    try {
      const res = await fetch(`/api/wireguard/client/${client.id}/configuration`);
      const config = await res.text();
      const qr = await QRCode.toDataURL(config, { width: 300, margin: 2 });
      setQrModal({ client, qr });
    } catch (e) {
      console.error("Failed to generate QR:", e);
    }
  };

  const copyConfig = async (client: Client) => {
    try {
      const res = await fetch(`/api/wireguard/client/${client.id}/configuration`);
      const config = await res.text();
      await navigator.clipboard.writeText(config);
      setCopiedId(client.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Failed to copy config:", e);
    }
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
    return now - lastHandshake < 3 * 60 * 1000; // 3 minutes
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div
        className="splash-container"
        style={{
          position: "fixed",
          inset: 0,
          background: "#08090B",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        {/* Full screen background logo */}
        <div className="splash-logo" style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/splash-bg.png"
            alt="BABLO"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Dark overlay for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 30%, rgba(8, 9, 11, 0.7) 70%)",
          }}
        />

        {/* Text */}
        <div className="splash-text" style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: "60vh", opacity: 0 }}>
          <h1
            className="font-bablo"
            style={{
              fontSize: "4rem",
              color: "#F0B90B",
              letterSpacing: "0.15em",
              textShadow: "0 0 60px rgba(240, 185, 11, 0.6)",
              margin: 0,
            }}
          >
            BABLO VPN
          </h1>
          <p style={{ color: "#6B7280", marginTop: "12px", fontSize: "14px", letterSpacing: "0.3em" }}>
            WIREGUARD MANAGEMENT
          </p>
        </div>

        {/* Shimmer line */}
        <div
          className="splash-shimmer"
          style={{
            position: "absolute",
            bottom: "80px",
            width: "200px",
            height: "2px",
            borderRadius: "2px",
            zIndex: 10,
          }}
        />
      </div>
    );
  }

  // Login screen
  if (!session?.authenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card animate-fadeIn" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Shield style={{ width: "32px", height: "32px", color: "#F0B90B" }} />
            </div>
            <h1 className="font-bablo" style={{ fontSize: "28px", fontWeight: 600, margin: 0, color: "#F0B90B", letterSpacing: "0.05em" }}>BABLO VPN</h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>WireGuard Management</p>
          </div>

          <form onSubmit={login}>
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <p style={{ color: "#EF4444", fontSize: "14px", marginTop: "12px" }}>{error}</p>
            )}
            <button
              type="submit"
              className="btn-gold"
              style={{ width: "100%", marginTop: "16px" }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" style={{ width: "20px", height: "20px" }} /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" style={{ width: "40px", height: "40px", color: "#F0B90B" }} />
      </div>
    );
  }

  const onlineCount = clients.filter(isOnline).length;

  // Main dashboard
  return (
    <div style={{ minHeight: "100vh", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Background logo */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80vw",
        height: "80vh",
        opacity: 0.03,
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <Image
          src="/splash-bg.png"
          alt=""
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0.1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Shield style={{ width: "24px", height: "24px", color: "#F0B90B" }} />
            </div>
            <div>
              <h1 className="font-bablo" style={{ fontSize: "22px", fontWeight: 600, margin: 0, color: "#F0B90B", letterSpacing: "0.05em" }}>BABLO VPN</h1>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>WireGuard Clients</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={loadClients} className="btn-secondary" style={{ padding: "10px 16px" }}>
              <RefreshCw style={{ width: "18px", height: "18px" }} />
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus style={{ width: "18px", height: "18px" }} />
              Add Client
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Users style={{ width: "20px", height: "20px", color: "#F0B90B" }} />
              <div>
                <p style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Total Clients</p>
                <p style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>{clients.length}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Activity style={{ width: "20px", height: "20px", color: "#10B981" }} />
              <div>
                <p style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Online Now</p>
                <p style={{ fontSize: "24px", fontWeight: 600, margin: 0, color: "#10B981" }}>{onlineCount}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ArrowDownToLine style={{ width: "20px", height: "20px", color: "#3B82F6" }} />
              <div>
                <p style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>Total Traffic</p>
                <p style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>
                  {formatBytes(clients.reduce((sum, c) => sum + c.transferRx + c.transferTx, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {clients.map((client) => (
            <div key={client.id} className="card animate-fadeIn" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    flexShrink: 0
                  }} className={isOnline(client) ? "status-online" : "status-offline"} />
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{client.name}</h3>
                    <p style={{ color: "#6B7280", fontSize: "12px", margin: "4px 0 0" }}>{client.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleClient(client)}
                  style={{
                    padding: "6px",
                    borderRadius: "8px",
                    border: "none",
                    background: client.enabled ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)",
                    cursor: "pointer"
                  }}
                >
                  <Power style={{
                    width: "16px",
                    height: "16px",
                    color: client.enabled ? "#10B981" : "#6B7280"
                  }} />
                </button>
              </div>

              {/* Traffic stats */}
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

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => downloadConfig(client)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px" }}
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  Config
                </button>
                <button
                  onClick={() => showQR(client)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px" }}
                >
                  <QrCode style={{ width: "14px", height: "14px" }} />
                  QR
                </button>
                <button
                  onClick={() => copyConfig(client)}
                  className="btn-secondary"
                  style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {copiedId === client.id ? (
                    <Check style={{ width: "14px", height: "14px", color: "#10B981" }} />
                  ) : (
                    <Copy style={{ width: "14px", height: "14px" }} />
                  )}
                </button>
                <button
                  onClick={() => deleteClient(client)}
                  className="btn-secondary"
                  style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
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
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gold"
              style={{ marginTop: "16px" }}
            >
              Add First Client
            </button>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50
        }} onClick={() => setShowAddModal(false)}>
          <div
            className="card animate-fadeIn"
            style={{ padding: "24px", width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>New Client</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <X style={{ width: "20px", height: "20px", color: "#6B7280" }} />
              </button>
            </div>
            <form onSubmit={addClient}>
              <input
                type="text"
                className="input"
                placeholder="Client name (e.g. iPhone, MacBook)"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }} disabled={adding || !newClientName.trim()}>
                  {adding ? <Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50
        }} onClick={() => setQrModal(null)}>
          <div
            className="card animate-fadeIn"
            style={{ padding: "24px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>{qrModal.client.name}</h2>
            <img src={qrModal.qr} alt="QR Code" style={{ borderRadius: "12px" }} />
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "16px" }}>
              Scan with WireGuard app
            </p>
            <button onClick={() => setQrModal(null)} className="btn-secondary" style={{ marginTop: "16px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
