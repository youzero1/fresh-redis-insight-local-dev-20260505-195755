'use client';

import { useState } from 'react';
import type { ConnectionConfig } from './Dashboard';
import styles from './ConnectionPanel.module.css';

type Props = {
  config: ConnectionConfig;
  setConfig: (config: ConnectionConfig) => void;
  connected: boolean;
  setConnected: (v: boolean) => void;
};

export default function ConnectionPanel({ config, setConfig, connected, setConnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<Record<string, unknown> | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/redis/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setServerInfo(data.info);
      } else {
        setError(data.error || 'Connection failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setServerInfo(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Connection</h3>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Host</label>
          <input
            className={styles.input}
            value={config.host}
            onChange={e => setConfig({ ...config, host: e.target.value })}
            placeholder="localhost"
            disabled={connected}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Port</label>
          <input
            className={styles.input}
            value={config.port}
            onChange={e => setConfig({ ...config, port: e.target.value })}
            placeholder="6379"
            disabled={connected}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={config.password}
            onChange={e => setConfig({ ...config, password: e.target.value })}
            placeholder="Optional"
            disabled={connected}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Database</label>
          <input
            className={styles.input}
            value={config.db}
            onChange={e => setConfig({ ...config, db: e.target.value })}
            placeholder="0"
            disabled={connected}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!connected ? (
          <button
            className={`${styles.btn} ${styles.connectBtn}`}
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : '🔗 Connect'}
          </button>
        ) : (
          <button
            className={`${styles.btn} ${styles.disconnectBtn}`}
            onClick={handleDisconnect}
          >
            🔌 Disconnect
          </button>
        )}
      </div>

      {serverInfo && (
        <div className={styles.serverInfo}>
          <h4 className={styles.infoTitle}>Server Info</h4>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Version</span>
            <span className={styles.infoValue}>{String(serverInfo.serverVersion)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Memory</span>
            <span className={styles.infoValue}>{String(serverInfo.usedMemory)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Clients</span>
            <span className={styles.infoValue}>{String(serverInfo.connectedClients)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Uptime</span>
            <span className={styles.infoValue}>{Math.floor(Number(serverInfo.uptimeSeconds) / 3600)}h</span>
          </div>
        </div>
      )}
    </div>
  );
}
