import type { EmailFieldProps } from '../types';

type Updater = <K extends keyof EmailFieldProps>(key: K, value: EmailFieldProps[K]) => void;

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', cursor: 'pointer' }}>
      <span style={{ fontSize: 13, color: '#d1d5db' }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          background: value ? '#3b82f6' : '#4b5563',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: value ? 18 : 2,
          transition: 'left 0.2s',
        }} />
      </div>
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '6px 8px', fontSize: 13,
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569',
          borderRadius: 4, outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: 13,
          background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569',
          borderRadius: 4, outline: 'none',
        }}
      />
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#d1d5db' }}>{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#3b82f6' }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 12, marginBottom: 4, borderTop: '1px solid #334155', paddingTop: 10 }}>
      {children}
    </div>
  );
}

export function PropertyPanel({ props, onChange }: { props: EmailFieldProps; onChange: Updater }) {
  return (
    <div style={{ padding: '8px 16px 16px', fontSize: 13 }}>
      <SectionLabel>Copy</SectionLabel>
      <TextInput label="Label" value={props.label} onChange={v => onChange('label', v)} />
      <TextInput label="Placeholder" value={props.placeholder} onChange={v => onChange('placeholder', v)} placeholder="Placeholder text..." />
      <TextInput label="Helper text" value={props.helperText} onChange={v => onChange('helperText', v)} placeholder="Optional helper text..." />

      <SectionLabel>Label</SectionLabel>
      <Toggle label="Show label" value={props.showLabel} onChange={v => onChange('showLabel', v)} />
      <Toggle label="Floating label" value={props.floatingLabel} onChange={v => onChange('floatingLabel', v)} />

      <SectionLabel>Icon</SectionLabel>
      <Toggle label="Show icon" value={props.showIcon} onChange={v => onChange('showIcon', v)} />
      {props.showIcon && (
        <Select label="Position" value={props.iconPosition} onChange={v => onChange('iconPosition', v as 'left' | 'right')} options={[
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ]} />
      )}

      <SectionLabel>Validation</SectionLabel>
      <Select label="Mode" value={props.validation} onChange={v => onChange('validation', v as EmailFieldProps['validation'])} options={[
        { value: 'none', label: 'None' },
        { value: 'on-blur', label: 'On blur' },
        { value: 'real-time', label: 'Real-time' },
      ]} />
      {props.validation !== 'none' && (
        <>
          <Toggle label="Show success state" value={props.showSuccessState} onChange={v => onChange('showSuccessState', v)} />
          <Select label="Error style" value={props.errorStyle} onChange={v => onChange('errorStyle', v as 'inline' | 'tooltip')} options={[
            { value: 'inline', label: 'Inline message' },
            { value: 'tooltip', label: 'Tooltip' },
          ]} />
        </>
      )}

      <SectionLabel>Features</SectionLabel>
      <Toggle label="Confirm field" value={props.confirmField} onChange={v => onChange('confirmField', v)} />
      <Toggle label="Domain suggestions" value={props.domainSuggest} onChange={v => onChange('domainSuggest', v)} />
      <Toggle label="Autocomplete" value={props.autoComplete} onChange={v => onChange('autoComplete', v)} />

      <SectionLabel>Required</SectionLabel>
      <Toggle label="Required" value={props.required} onChange={v => onChange('required', v)} />
      {props.required && (
        <Select label="Indicator" value={props.requiredIndicator} onChange={v => onChange('requiredIndicator', v as EmailFieldProps['requiredIndicator'])} options={[
          { value: 'asterisk', label: 'Asterisk (*)' },
          { value: 'text', label: 'Text (required)' },
          { value: 'none', label: 'None' },
        ]} />
      )}

      <SectionLabel>Style</SectionLabel>
      <Select label="Size" value={props.size} onChange={v => onChange('size', v as 'sm' | 'md' | 'lg')} options={[
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ]} />
      <Select label="Border style" value={props.borderStyle} onChange={v => onChange('borderStyle', v as EmailFieldProps['borderStyle'])} options={[
        { value: 'outlined', label: 'Outlined' },
        { value: 'filled', label: 'Filled' },
        { value: 'underline', label: 'Underline' },
      ]} />
      <Slider label="Border radius" value={props.borderRadius} min={0} max={24} onChange={v => onChange('borderRadius', v)} />
    </div>
  );
}
