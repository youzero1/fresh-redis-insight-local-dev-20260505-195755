'use client';

import { useState, useEffect } from 'react';
import styles from './KeyViewer.module.css';

type Props = {
  selectedKey: string | null;
};

type KeyData = {
  key: string;
  type: string;
  ttl: number;
  value: unknown;
};

export default function KeyViewer({ selectedKey }: Props) {
  const [data, setData] = useState<KeyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editTTL, setEditTTL] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedKey) {
      setData(null);
      return;
    }
    setLoading(true);
    setEditMode(false);
    setSaveMsg(null);
    fetch(`/api/redis/key?key=${encodeURIComponent(selectedKey)}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setEditValue(typeof d.value === 'object' ? JSON.stringify(d.value, null, 2) : String(d.value));
        setEditTTL(String(d.ttl));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedKey]);

  const handleSave = async () => {
    if (!data) return;
    try {
      await fetch('/api/redis/key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: data.key, value: editValue, ttl: parseInt(editTTL) }),
      });
      setSaveMsg('Saved successfully!');
      setEditMode(false);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg('Save failed');
    }
  };

  const formatTTL = (ttl: number) => {
    if (ttl === -1) return 'No expiry';
    if (ttl < 60) return `${ttl} seconds`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)} minutes`;
    return `${Math.floor(ttl / 3600)} hours`;
  };

  const renderValue = (value: unknown, type: string) => {
    if (type === 'hash' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <table className={styles.hashTable}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value as Record<string, string>).map(([k, v]) => (
              <tr key={k}>
                <td className={styles.hashField}>{k}</td>
                <td className={styles.hashValue}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if ((type === 'list' || type === 'set') && Array.isArray(value)) {
      return (
        <div className={styles.listItems}>
          {(value as string[]).map((item, i) => (
            <div key={i} className={styles.listItem}>
              <span className={styles.listIndex}>{i}</span>
              <span className={styles.listValue}>{item}</span>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'zset' && Array.isArray(value)) {
      type ZSetMember = { member: string; score: number };
      return (
        <table className={styles.hashTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Member</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {(value as ZSetMember[]).map((item, i) => (
              <tr key={i}>
                <td className={styles.hashField}>{i + 1}</td>
                <td className={styles.hashValue}>{item.member}</td>
                <td className={styles.hashValue} style={{ color: '#fbbf24' }}>{item.score.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <pre className={styles.rawValue}>
        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      </pre>
    );
  };

  if (!selectedKey) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>Select a key to inspect</h3>
        <p>Click any key in the browser to view its details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading key data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>❌</div>
        <h3>Key not found</h3>
      </div>
    );
  }

  return (
    <div className={styles.viewer}>
      <div className={styles.viewerHeader}>
        <div className={styles.keyInfo}>
          <h2 className={styles.keyName}>{data.key}</h2>
          <div className={styles.keyMeta}>
            <span className={styles.typeBadge} data-type={data.type}>{data.type}</span>
            <span className={styles.ttlBadge}>⏱ {formatTTL(data.ttl)}</span>
          </div>
        </div>
        <div className={styles.actions}>
          {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
          {!editMode ? (
            <button className={styles.editBtn} onClick={() => setEditMode(true)}>✏️ Edit</button>
          ) : (
            <>
              <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>💾 Save</button>
            </>
          )}
        </div>
      </div>

      {editMode ? (
        <div className={styles.editArea}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>TTL (seconds, -1 = no expiry)</label>
            <input
              className={styles.editInput}
              value={editTTL}
              onChange={e => setEditTTL(e.target.value)}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Value</label>
            <textarea
              className={styles.editTextarea}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              rows={20}
            />
          </div>
        </div>
      ) : (
        <div className={styles.valueArea}>
          {renderValue(data.value, data.type)}
        </div>
      )}
    </div>
  );
}
