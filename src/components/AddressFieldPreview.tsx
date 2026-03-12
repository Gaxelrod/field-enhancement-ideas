import { useState, useRef, useEffect, useCallback } from 'react';
import type { AddressFieldProps } from '../addressTypes';

const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;
const AWS_REGION = 'us-west-2';

interface AwsSuggestion {
  PlaceId: string;
  Title: string;
  PlaceType: string;
  Address?: {
    Label?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function AddressFieldPreview({ props, onStateChange }: { props: AddressFieldProps; onStateChange?: (state: string) => void }) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, _setState] = useState('');
  const [zip, setZip] = useState('');

  const setState = (val: string) => {
    _setState(val);
    onStateChange?.(val);
  };

  const [suggestions, setSuggestions] = useState<AwsSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const justSelected = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const userLocation = useRef<[number, number] | null>(null);
  const userRegion = useRef<string | null>(null);

  // Get approximate location from IP (silent, no prompt)
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          userLocation.current = [data.longitude, data.latitude];
          userRegion.current = data.region_code || data.region || null;
          console.log('IP location bias:', data.city, data.region, data.region_code, userLocation.current);
        }
      })
      .catch(() => {});
  }, []);

  const search = useCallback(
    debounce(async (q: string) => {
      if (q.length < 3) { setSuggestions([]); return; }
      setLoading(true);
      try {
        const makeBody = (useCircle: boolean): Record<string, unknown> => {
          const filter: Record<string, unknown> = {
            IncludeCountries: ['USA'],
          };
          if (userLocation.current) {
            if (useCircle) {
              filter.Circle = { Center: userLocation.current, Radius: 150000 };
            }
          }
          const body: Record<string, unknown> = {
            QueryText: q,
            Filter: filter,
            MaxResults: 5,
          };
          if (userLocation.current && !useCircle) {
            body.BiasPosition = userLocation.current;
          }
          return body;
        };

        // Try circle filter first, fall back to bias if empty
        let res = await fetch(
          `https://places.geo.${AWS_REGION}.amazonaws.com/v2/autocomplete?key=${API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(makeBody(true)) }
        );
        let data = await res.json();
        let items = data.ResultItems || [];

        if (items.length === 0 && userLocation.current) {
          res = await fetch(
            `https://places.geo.${AWS_REGION}.amazonaws.com/v2/autocomplete?key=${API_KEY}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(makeBody(false)) }
          );
          data = await res.json();
          items = data.ResultItems || [];
        }

        // Sort: user's state first
        if (userRegion.current) {
          const region = userRegion.current.toUpperCase();
          items.sort((a: AwsSuggestion, b: AwsSuggestion) => {
            const aMatch = a.Title?.includes(`, ${region},`) || a.Address?.Label?.includes(`, ${region} `) ? 0 : 1;
            const bMatch = b.Title?.includes(`, ${region},`) || b.Address?.Label?.includes(`, ${region} `) ? 0 : 1;
            return aMatch - bMatch;
          });
        }

        setSuggestions(items);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (!selected) search(street);
  }, [street, search, selected]);

  const handleSelect = async (suggestion: AwsSuggestion) => {
    justSelected.current = true;
    setSuggestions([]);
    setSelected(true);

    // Fetch full place details
    if (suggestion.PlaceId) {
      try {
        const res = await fetch(
          `https://places.geo.${AWS_REGION}.amazonaws.com/v2/get-place/${suggestion.PlaceId}?key=${API_KEY}&language=en`,
        );
        const data = await res.json();
        console.log('GetPlace response:', data);
        const addr = data.Address;
        if (addr) {
          setStreet([addr.AddressNumber, addr.Street].filter(Boolean).join(' '));
          setCity(addr.Locality || addr.Municipality || '');
          setState(addr.Region || addr.SubRegion || '');
          setZip(addr.PostalCode || '');
          return;
        }
      } catch {
        // fallback
      }
    }

    // Fallback: parse from label
    const label = suggestion.Address?.Label || suggestion.Title;
    const parts = label.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      setStreet(parts[0] || '');
      setCity(parts[1] || '');
      if (parts.length >= 3) setState(parts[2] || '');
      // Try to extract zip from state part like "MN 55344"
      const stateZip = (parts[2] || '').match(/^([A-Z]{2})\s+(\d{5})/);
      if (stateZip) {
        setState(stateZip[1]);
        setZip(stateZip[2]);
      }
    }
  };

  const handleStreetChange = (value: string) => {
    setStreet(value);
    setSelected(false);
  };

  const sizeMap = { sm: { padding: '6px 10px', fontSize: 13 }, md: { padding: '10px 14px', fontSize: 15 }, lg: { padding: '14px 18px', fontSize: 17 } };
  const s = sizeMap[props.size];

  const borderColor = focused ? '#3b82f6' : '#d1d5db';
  const borderStyles: Record<string, React.CSSProperties> = {
    outlined: { border: `2px solid ${borderColor}`, borderRadius: props.borderRadius, background: '#fff' },
    filled: { border: 'none', borderBottom: `2px solid ${borderColor}`, borderRadius: `${props.borderRadius}px ${props.borderRadius}px 0 0`, background: '#f3f4f6' },
    underline: { border: 'none', borderBottom: `2px solid ${borderColor}`, borderRadius: 0, background: 'transparent' },
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: s.padding,
    fontSize: s.fontSize,
    outline: 'none',
    transition: 'all 0.2s',
    color: '#111827',
    border: `1px solid #d1d5db`,
    borderRadius: props.borderRadius,
    background: '#fff',
  };

  const streetStyle: React.CSSProperties = {
    ...fieldStyle,
    paddingLeft: props.showIcon ? 36 : undefined,
    ...borderStyles[props.borderStyle],
  };

  return (
    <div style={{ padding: '20px 16px', background: '#fff', borderRadius: 8, minHeight: 100, position: 'relative' }}>
      {/* Street field with autocomplete */}
      <div style={{ marginBottom: 12 }}>
        {props.showLabel && (
          <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Street Address
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {props.showIcon && (
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: s.fontSize, pointerEvents: 'none' }}>
              📍
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={street}
            onChange={e => handleStreetChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setTimeout(() => setFocused(false), 200); }}
            placeholder={props.placeholder}
            autoComplete="off"
            style={streetStyle}
          />
          {loading && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 12 }}>
              ...
            </span>
          )}

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && focused && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
              marginTop: 4, overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              {suggestions.map((r, i) => (
                <div
                  key={r.PlaceId}
                  onMouseDown={e => { e.preventDefault(); handleSelect(r); }}
                  style={{
                    padding: '10px 12px', fontSize: 13, cursor: 'pointer',
                    color: '#374151',
                    borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#9ca3af', flexShrink: 0, marginTop: 1 }}>📍</span>
                  <span style={{ lineHeight: 1.4 }}>{r.Address?.Label || r.Title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address 2 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Apt, Suite, Unit <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder="Apt 4B, Suite 200, etc."
          style={fieldStyle}
        />
      </div>

      {/* City / State / ZIP */}
      {props.showSubFields && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>City</label>
            <input value={city} onChange={e => setCity(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>State</label>
            <input value={state} onChange={e => setState(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: s.fontSize - 2, fontWeight: 500, color: '#374151', marginBottom: 6 }}>ZIP</label>
            <input value={zip} onChange={e => setZip(e.target.value)} style={fieldStyle} />
          </div>
        </div>
      )}

      {props.helperText && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{props.helperText}</div>
      )}
    </div>
  );
}
