'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RedisKey } from './Dashboard';
import styles from './KeyBrowser.module.css';

type Props = {
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
};

const typeColors: Record<string, string> = {
  string: '#4da6ff',
  hash: '#f97316',
  list: '#a78bfa',
  set: '#34d399',
  zset: '#fbbf24',
  stream: '#f472b6',
};

export default function KeyBrowser({ selectedKey, onSelectKey }: Props) {
  const [keys, setKeys] = useState<RedisKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [pattern, setPattern] = useState('*');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/redis/keys?pattern=${encodeURIComponent(pattern)}&page=${page}&limit=10`);
      const data = await res.json();
      setKeys(data.keys || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, [pattern, page]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleDelete = async (key: string) => {
    try {
      await fetch('/api/redis/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      setDeleteTarget(null);
      fetchKeys();
    } catch {
      // ignore
    }
  };

  const formatTTL = (ttl: number) => {
    if (ttl === -1) return '∞';
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
    return `${Math.floor(ttl / 3600)}h`;
  };

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            value={pattern}
            onChange={e => { setPattern(e.target.value); setPage(1); }}
            placeholder="Search pattern (e.g. user:*)" 
          />
          <button className={styles.refreshBtn} onClick={fetchKeys} title="Refresh">
            🔄
          </button>
        </div>
        <div className={styles.meta}>
          <span className={styles.total}>{total} keys</span>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Loading keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className={styles.empty}>No keys found</div>
        ) : (
          keys.map(k => (
            <div
              key={k.key}
              className={`${styles.keyItem} ${selectedKey === k.key ? styles.selected : ''}`}
              onClick={() => onSelectKey(k.key)}
            >
              <div className={styles.keyMain}>
                <span
                  className={styles.typeBadge}
                  style={{ background: `${typeColors[k.type] || '#94a3b8'}22`, color: typeColors[k.type] || '#94a3b8', borderColor: `${typeColors[k.type] || '#94a3b8'}44` }}
                >
                  {k.type}
                </span>
                <span className={styles.keyName}>{k.key}</span>
              </div>
              <div className={styles.keyMeta}>
                <span className={styles.ttl} title="TTL">{formatTTL(k.ttl)}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={e => { e.stopPropagation(); setDeleteTarget(k.key); }}
                  title="Delete key"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3 className={styles.dialogTitle}>Delete Key</h3>
            <p className={styles.dialogMsg}>Are you sure you want to delete:</p>
            <code className={styles.dialogKey}>{deleteTarget}</code>
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className={styles.confirmBtn} onClick={() => handleDelete(deleteTarget)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
