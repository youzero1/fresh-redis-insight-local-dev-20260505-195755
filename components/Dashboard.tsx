'use client';

import { useState } from 'react';
import ConnectionPanel from './ConnectionPanel';
import KeyBrowser from './KeyBrowser';
import KeyViewer from './KeyViewer';
import StatsPanel from './StatsPanel';
import styles from './Dashboard.module.css';

export type ConnectionConfig = {
  host: string;
  port: string;
  password: string;
  db: string;
};

export type RedisKey = {
  key: string;
  type: string;
  ttl: number;
  size: number;
};

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    host: 'localhost',
    port: '6379',
    password: '',
    db: '0',
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browser' | 'stats'>('browser');

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>Redis Insight Key</span>
          </div>
          <div className={`${styles.connectionBadge} ${connected ? styles.connected : styles.disconnected}`}>
            <span className={styles.dot}></span>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${activeTab === 'browser' ? styles.active : ''}`}
            onClick={() => setActiveTab('browser')}
          >
            🗝️ Key Browser
          </button>
          <button
            className={`${styles.navBtn} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
        </nav>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <ConnectionPanel
            config={connectionConfig}
            setConfig={setConnectionConfig}
            connected={connected}
            setConnected={setConnected}
          />
        </aside>

        <main className={styles.content}>
          {!connected ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔌</div>
              <h2>Not Connected</h2>
              <p>Configure your Redis connection in the sidebar to get started.</p>
            </div>
          ) : activeTab === 'browser' ? (
            <div className={styles.browserLayout}>
              <div className={styles.keyList}>
                <KeyBrowser
                  selectedKey={selectedKey}
                  onSelectKey={setSelectedKey}
                />
              </div>
              <div className={styles.keyDetail}>
                <KeyViewer selectedKey={selectedKey} />
              </div>
            </div>
          ) : (
            <StatsPanel />
          )}
        </main>
      </div>
    </div>
  );
}
