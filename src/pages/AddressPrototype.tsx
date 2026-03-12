import { defaultAddressProps } from '../addressTypes';
import { AddressFieldPreview } from '../components/AddressFieldPreview';

export function AddressPrototype() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: '#f1f5f9',
            margin: '0 0 8px',
          }}>
            Address Autocomplete
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Start typing your street address to see suggestions
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible',
        }}>
          <AddressFieldPreview props={{
            ...defaultAddressProps,
            showIcon: true,
            showSubFields: true,
            showCountry: false,
            borderStyle: 'outlined',
            borderRadius: 8,
            size: 'md',
            placeholder: 'Start typing your address...',
          }} />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: '#475569' }}>
            Powered by AWS Location Service
          </p>
        </div>
      </div>
    </div>
  );
}
