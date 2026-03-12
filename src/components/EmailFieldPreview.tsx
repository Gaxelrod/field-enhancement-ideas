import { useState, useRef, useEffect } from 'react';
import type { EmailFieldProps } from '../types';

const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'mail.com',
  'gmx.com', 'zoho.com',
];

function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email) return { valid: false, message: '' };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, message: 'Please enter a valid email address' };
  return { valid: true, message: 'Looks good!' };
}

function getDomainSuggestions(value: string): string[] {
  const atIdx = value.indexOf('@');
  if (atIdx === -1 || atIdx === 0) return [];
  const prefix = value.slice(0, atIdx);
  const domainPart = value.slice(atIdx + 1).toLowerCase();
  if (!domainPart) return COMMON_DOMAINS.slice(0, 4).map(d => `${prefix}@${d}`);
  return COMMON_DOMAINS
    .filter(d => d.startsWith(domainPart))
    .slice(0, 4)
    .map(d => `${prefix}@${d}`);
}

export function EmailFieldPreview({ props }: { props: EmailFieldProps }) {
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelected = useRef(false);

  const { valid, message } = validateEmail(value);
  const showError = props.validation !== 'none' && touched && !valid && value.length > 0;
  const showSuccess = props.validation !== 'none' && props.showSuccessState && valid;
  const confirmMismatch = props.confirmField && confirmValue && confirmValue !== value;

  const sizeMap = { sm: { padding: '6px 10px', fontSize: 13 }, md: { padding: '10px 14px', fontSize: 15 }, lg: { padding: '14px 18px', fontSize: 17 } };
  const s = sizeMap[props.size];

  const borderColor = showError ? '#ef4444' : showSuccess ? '#22c55e' : focused ? '#3b82f6' : '#d1d5db';
  const borderStyles: Record<string, React.CSSProperties> = {
    outlined: { border: `2px solid ${borderColor}`, borderRadius: props.borderRadius, background: '#fff' },
    filled: { border: 'none', borderBottom: `2px solid ${borderColor}`, borderRadius: `${props.borderRadius}px ${props.borderRadius}px 0 0`, background: '#f3f4f6' },
    underline: { border: 'none', borderBottom: `2px solid ${borderColor}`, borderRadius: 0, background: 'transparent' },
  };

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (props.domainSuggest && focused) {
      setSuggestions(getDomainSuggestions(value));
    } else {
      setSuggestions([]);
    }
  }, [value, focused, props.domainSuggest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (props.validation === 'real-time') setTouched(true);
  };

  const handleBlur = () => {
    setFocused(false);
    if (props.validation === 'on-blur') setTouched(true);
  };

  const labelText = props.label + (props.required && props.requiredIndicator === 'asterisk' ? ' *' : '') +
    (props.required && props.requiredIndicator === 'text' ? ' (required)' : '');

  return (
    <div style={{ padding: '20px 16px', background: '#fff', borderRadius: 8, minHeight: 100, position: 'relative' }}>
      {/* Standard label */}
      {props.showLabel && !props.floatingLabel && (
        <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          {labelText}
        </label>
      )}

      {/* Input wrapper */}
      <div style={{ position: 'relative' }}>
        {/* Icon left */}
        {props.showIcon && props.iconPosition === 'left' && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: s.fontSize, pointerEvents: 'none' }}>
            ✉
          </span>
        )}

        {/* Floating label */}
        {props.floatingLabel && props.showLabel && (
          <label style={{
            position: 'absolute',
            left: props.showIcon && props.iconPosition === 'left' ? 36 : 14,
            top: focused || value ? 4 : '50%',
            transform: focused || value ? 'none' : 'translateY(-50%)',
            fontSize: focused || value ? 10 : s.fontSize,
            color: focused ? '#3b82f6' : '#9ca3af',
            transition: 'all 0.2s',
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            {labelText}
          </label>
        )}

        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={props.floatingLabel && props.showLabel ? (focused ? props.placeholder : '') : props.placeholder}
          autoComplete={props.autoComplete ? 'email' : 'off'}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: props.floatingLabel && (focused || value) ? `18px ${s.padding.split(' ')[1]} 6px` : s.padding,
            paddingLeft: props.showIcon && props.iconPosition === 'left' ? 36 : undefined,
            paddingRight: props.showIcon && props.iconPosition === 'right' ? 36 : undefined,
            fontSize: s.fontSize,
            outline: 'none',
            transition: 'all 0.2s',
            color: '#111827',
            ...borderStyles[props.borderStyle],
          }}
        />

        {/* Icon right */}
        {props.showIcon && props.iconPosition === 'right' && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: s.fontSize, pointerEvents: 'none' }}>
            ✉
          </span>
        )}

        {/* Validation icon */}
        {(showError || showSuccess) && (
          <span style={{
            position: 'absolute',
            right: props.showIcon && props.iconPosition === 'right' ? 36 : 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: showError ? '#ef4444' : '#22c55e',
            fontSize: s.fontSize,
          }}>
            {showError ? '✕' : '✓'}
          </span>
        )}
      </div>

      {/* Domain suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          marginTop: 4,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); justSelected.current = true; setValue(s); setSuggestions([]); inputRef.current?.focus(); }}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                cursor: 'pointer',
                background: i === 0 ? '#eff6ff' : 'transparent',
                color: i === 0 ? '#3b82f6' : '#6b7280',
                borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Error / success message */}
      {props.errorStyle === 'inline' && showError && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{message}</div>
      )}
      {showSuccess && (
        <div style={{ fontSize: 12, color: '#22c55e', marginTop: 6 }}>✓ {message}</div>
      )}

      {/* Helper text */}
      {props.helperText && !showError && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{props.helperText}</div>
      )}

      {/* Confirm field */}
      {props.confirmField && (
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Confirm email
          </label>
          <input
            type="email"
            value={confirmValue}
            onChange={e => setConfirmValue(e.target.value)}
            placeholder="Re-enter your email"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: s.padding,
              fontSize: s.fontSize,
              outline: 'none',
              transition: 'all 0.2s',
              color: '#111827',
              ...borderStyles[props.borderStyle],
              borderColor: confirmMismatch ? '#ef4444' : borderColor,
            }}
          />
          {confirmMismatch && (
            <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Emails don't match</div>
          )}
        </div>
      )}
    </div>
  );
}
