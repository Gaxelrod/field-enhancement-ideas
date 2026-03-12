import { useState } from 'react';
import type { EmailVariation, EmailFieldProps } from '../types';
import { EmailFieldPreview } from './EmailFieldPreview';
import { PropertyPanel } from './PropertyPanel';

interface Props {
  variation: EmailVariation;
  onUpdate: (id: string, updates: Partial<EmailVariation>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function VariationCard({ variation, onUpdate, onDelete, onDuplicate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(variation.name);

  const updateProp = <K extends keyof EmailFieldProps>(key: K, value: EmailFieldProps[K]) => {
    onUpdate(variation.id, { props: { ...variation.props, [key]: value } });
  };

  const saveName = () => {
    onUpdate(variation.id, { name: nameValue });
    setEditingName(false);
  };

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      overflow: 'hidden',
      border: variation.starred ? '2px solid #e94560' : '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        background: '#0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {editingName ? (
            <input
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
              style={{
                background: '#1e293b', border: '1px solid #475569', borderRadius: 4,
                color: '#f1f5f9', fontSize: 14, fontWeight: 600, padding: '2px 8px',
                outline: 'none', width: '100%',
              }}
            />
          ) : (
            <span
              onClick={() => setEditingName(true)}
              style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              title="Click to rename"
            >
              {variation.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onDuplicate(variation.id)}
            title="Duplicate"
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '2px 4px' }}
          >
            ⧉
          </button>
          <button
            onClick={() => onDelete(variation.id)}
            title="Delete"
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '2px 4px' }}
          >
            ✕
          </button>
          <button
            onClick={() => onUpdate(variation.id, { starred: !variation.starred })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 4px', color: variation.starred ? '#e94560' : '#475569' }}
          >
            {variation.starred ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div style={{ margin: 12, borderRadius: 8, overflow: 'hidden' }}>
        <EmailFieldPreview props={variation.props} />
      </div>

      {/* Properties toggle + panel */}
      <div style={{ borderTop: '1px solid #1e293b' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', background: 'none', border: 'none',
            padding: '10px 16px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: 12,
          }}
        >
          <span>Properties</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </button>
        {expanded && <PropertyPanel props={variation.props} onChange={updateProp} />}
      </div>
    </div>
  );
}
