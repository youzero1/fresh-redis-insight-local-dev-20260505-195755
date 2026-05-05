'use client';

import { useState, useEffect } from 'react';
import styles from './StatsPanel.module.css';

type Stats = {
  totalKeys: number;
  usedMemory: string;
  usedMemoryPeak: string;
  connectedClients: number;
  totalCommands: number;
  opsPerSecond: number;
  hitRate: number;
  keysByType: Record<string, number>;
  keysByTTL: Record<string, number>;
  serverInfo: {
    version: string;
    mode: string;
    os: string;
    arch: string;
    uptimeDays: number;
  };
};

const typeColors: Record<string, string> = {
  string: '#4da6ff',
  hash: '#f97316',
  list: '#a78bfa',
  set: '#34d399',
  zset: '#fbbf24',
  stream: '#f472b6',
};

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/redis/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading statistics...</span>
      </div>
    );
  }

  if (!stats) {
    return <div className={styles.error}>Failed to load statistics</div>;
  }

  const maxTypeCount = Math.max(...Object.values(stats.keysByType));

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🗝️</div>
          <div className={styles.cardValue}>{stats.totalKeys.toLocaleString()}</div>
          <div className={styles.cardLabel}>Total Keys</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>💾</div>
          <div className={styles.cardValue}>{stats.usedMemory}</div>
          <div className={styles.cardLabel}>Used Memory</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardValue}>{stats.connectedClients}</div>
          <div className={styles.cardLabel}>Connected Clients</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>⚡</div>
          <div className={styles.cardValue}>{stats.opsPerSecond}</div>
          <div className={styles.cardLabel}>Ops/Second</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <div className={styles.cardValue}>{stats.hitRate}%</div>
          <div className={styles.cardLabel}>Cache Hit Rate</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📝</div>
          <div className={styles.cardValue}>{stats.totalCommands.toLocaleString()}</div>
          <div className={styles.cardLabel}>Total Commands</div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Keys by Type</h3>
          <div className={styles.typeList}>
            {Object.entries(stats.keysByType).map(([type, count]) => (
              <div key={type} className={styles.typeRow}>
                <span className={styles.typeLabel} style={{ color: typeColors[type] || '#94a3b8' }}>{type}</span>
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{
                      width: maxTypeCount > 0 ? `${(count / maxTypeCount) * 100}%` : '0%',
                      background: typeColors[type] || '#94a3b8',
                    }}
                  ></div>
                </div>
                <span className={styles.typeCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Keys by TTL</h3>
          <div className={styles.ttlGrid}>
            {Object.entries(stats.keysByTTL).map(([label, count]) => {
              const labels: Record<string, string> = {
                noExpiry: 'No Expiry',
                lessThan1Min: '< 1 Min',
                lessThan1Hour: '< 1 Hour',
                moreThan1Hour: '> 1 Hour',
              };
              return (
                <div key={label} className={styles.ttlCard}>
                  <div className={styles.ttlCount}>{count}</div>
                  <div className={styles.ttlLabel}>{labels[label] || label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Server Information</h3>
        <div className={styles.serverGrid}>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>Redis Version</span>
            <span className={styles.serverValue}>{stats.serverInfo.version}</span>
          </div>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>Mode</span>
            <span className={styles.serverValue}>{stats.serverInfo.mode}</span>
          </div>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>OS</span>
            <span className={styles.serverValue}>{stats.serverInfo.os}</span>
          </div>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>Architecture</span>
            <span className={styles.serverValue}>{stats.serverInfo.arch}</span>
          </div>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>Uptime</span>
            <span className={styles.serverValue}>{stats.serverInfo.uptimeDays} days</span>
          </div>
          <div className={styles.serverRow}>
            <span className={styles.serverLabel}>Peak Memory</span>
            <span className={styles.serverValue}>{stats.usedMemoryPeak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
