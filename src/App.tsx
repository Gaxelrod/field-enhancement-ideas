import { useState } from 'react';
import type { EmailVariation, EmailFieldProps } from './types';
import { defaultEmailProps } from './types';
import { EMAIL_PRESETS, applyPreset } from './presets';
import { VariationCard } from './components/VariationCard';
import type { AddressVariation, AddressFieldProps } from './addressTypes';
import { defaultAddressProps } from './addressTypes';
import { AddressVariationCard } from './components/AddressVariationCard';

type FieldType = 'email' | 'address';

let nextId = 1;
function makeId() {
  return `v-${nextId++}`;
}

function createEmailVariation(name: string, props: EmailFieldProps): EmailVariation {
  return { id: makeId(), name, starred: false, props };
}

function createAddressVariation(name: string, props: AddressFieldProps): AddressVariation {
  return { id: makeId(), name, starred: false, props };
}

const iconUnderlineSuggest = EMAIL_PRESETS.find(p => p.name === 'Icon + Underline + Suggest')!;
const initialEmailVariations: EmailVariation[] = [
  createEmailVariation(iconUnderlineSuggest.name, applyPreset(iconUnderlineSuggest)),
];

const initialAddressVariations: AddressVariation[] = [
  createAddressVariation('Address Autocomplete', { ...defaultAddressProps }),
];

function App() {
  const [activeField, setActiveField] = useState<FieldType>('address');

  // Email state
  const [emailVariations, setEmailVariations] = useState<EmailVariation[]>(initialEmailVariations);
  const [showPresets, setShowPresets] = useState(false);

  // Address state
  const [addressVariations, setAddressVariations] = useState<AddressVariation[]>(initialAddressVariations);

  // Email handlers
  const addBlankEmail = () => {
    setEmailVariations(prev => [...prev, createEmailVariation(`Variation ${prev.length + 1}`, { ...defaultEmailProps })]);
  };
  const addFromPreset = (presetIdx: number) => {
    const p = EMAIL_PRESETS[presetIdx];
    setEmailVariations(prev => [...prev, createEmailVariation(p.name, applyPreset(p))]);
    setShowPresets(false);
  };
  const updateEmailVariation = (id: string, updates: Partial<EmailVariation>) => {
    setEmailVariations(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };
  const deleteEmailVariation = (id: string) => {
    setEmailVariations(prev => prev.filter(v => v.id !== id));
  };
  const duplicateEmailVariation = (id: string) => {
    setEmailVariations(prev => {
      const original = prev.find(v => v.id === id);
      if (!original) return prev;
      const copy = createEmailVariation(`${original.name} (copy)`, { ...original.props });
      const idx = prev.findIndex(v => v.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  // Address handlers
  const addBlankAddress = () => {
    setAddressVariations(prev => [...prev, createAddressVariation(`Variation ${prev.length + 1}`, { ...defaultAddressProps })]);
  };
  const updateAddressVariation = (id: string, updates: Partial<AddressVariation>) => {
    setAddressVariations(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };
  const deleteAddressVariation = (id: string) => {
    setAddressVariations(prev => prev.filter(v => v.id !== id));
  };
  const duplicateAddressVariation = (id: string) => {
    setAddressVariations(prev => {
      const original = prev.find(v => v.id === id);
      if (!original) return prev;
      const copy = createAddressVariation(`${original.name} (copy)`, { ...original.props });
      const idx = prev.findIndex(v => v.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const variations = activeField === 'email' ? emailVariations : addressVariations;
  const starredCount = variations.filter(v => v.starred).length;

  const tabStyle = (field: FieldType): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: activeField === field ? '#1e293b' : 'transparent',
    color: activeField === field ? '#e2e8f0' : '#64748b',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', background: '#0f172a', borderBottom: '1px solid #1e293b',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e94560' }}>Field Lab</span>
          <div style={{ display: 'flex', gap: 4, background: '#0a0f1a', borderRadius: 8, padding: 3 }}>
            <button style={tabStyle('email')} onClick={() => setActiveField('email')}>Email</button>
            <button style={tabStyle('address')} onClick={() => setActiveField('address')}>Address</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {starredCount > 0 && (
            <span style={{ fontSize: 13, color: '#e94560' }}>★ {starredCount} favorite{starredCount > 1 ? 's' : ''}</span>
          )}
          <span style={{ fontSize: 13, color: '#64748b' }}>{variations.length} variation{variations.length !== 1 ? 's' : ''}</span>
          {activeField === 'email' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPresets(!showPresets)}
                style={{
                  background: '#1e293b', color: '#94a3b8', border: '1px solid #334155',
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                }}
              >
                + From Preset
              </button>
              {showPresets && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
                  overflow: 'hidden', minWidth: 180, zIndex: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {EMAIL_PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => addFromPreset(i)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'none', border: 'none', color: '#e2e8f0',
                        padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                        borderBottom: i < EMAIL_PRESETS.length - 1 ? '1px solid #334155' : 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={activeField === 'email' ? addBlankEmail : addBlankAddress}
            style={{
              background: '#e94560', color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Variation
          </button>
        </div>
      </header>

      {/* Grid */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 20,
        padding: 24,
        maxWidth: 1600,
        margin: '0 auto',
      }}>
        {activeField === 'email' && emailVariations.map(v => (
          <VariationCard
            key={v.id}
            variation={v}
            onUpdate={updateEmailVariation}
            onDelete={deleteEmailVariation}
            onDuplicate={duplicateEmailVariation}
          />
        ))}
        {activeField === 'address' && addressVariations.map(v => (
          <AddressVariationCard
            key={v.id}
            variation={v}
            onUpdate={updateAddressVariation}
            onDelete={deleteAddressVariation}
            onDuplicate={duplicateAddressVariation}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
