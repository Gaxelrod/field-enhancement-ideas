import { EmployerFieldPreview } from '../components/EmployerFieldPreview';

export function EmployerPrototype() {
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
            Employer Autocomplete
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Start typing your employer name to see suggestions
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible',
        }}>
          <EmployerFieldPreview userState="CA" />
        </div>

        {/* Future idea note */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>
            Future Enhancement
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: '#e2e8f0' }}>Nearest Store Locator with Phone Number</strong> — Once the user selects an employer (e.g. Best Buy),
            use their zip code to find the nearest store location and auto-fill the employer's phone number.
            Requires enabling <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>SearchNearby</code> on
            the AWS Location Service API key. This would turn the employer field into a smart store locator
            that gives you the closest branch + contact info automatically.
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: '#475569' }}>
            Suggestions prioritized by your state
          </p>
        </div>
      </div>
    </div>
  );
}
