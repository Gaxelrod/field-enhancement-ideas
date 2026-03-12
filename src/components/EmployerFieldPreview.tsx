import { useState, useRef, useEffect, useCallback } from 'react';
import { EMPLOYERS } from '../data/employers';
import type { Employer } from '../data/employers';

interface ClearoutCompany {
  name: string;
  domain: string;
  confidence_score: number;
  logo_url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function fuzzyMatch(query: string, name: string): boolean {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n.includes(q)) return true;
  const words = n.split(/\s+/);
  const initials = words.map(w => w[0]).join('');
  if (initials.includes(q)) return true;
  return false;
}

function scoreLocalMatch(query: string, employer: Employer, userState: string | null): number {
  const q = query.toLowerCase();
  const n = employer.name.toLowerCase();
  let score = 0;
  if (n.startsWith(q)) score += 100;
  else if (n.split(/\s+/).some(w => w.toLowerCase().startsWith(q))) score += 75;
  else if (n.includes(q)) score += 50;
  if (userState && employer.state === userState.toUpperCase()) score += 30;
  return score;
}

interface Suggestion {
  name: string;
  logo?: string;
  industry?: string;
  nearYou?: boolean;
  source: 'local' | 'api';
}

interface Props {
  userState?: string | null;
}

export function EmployerFieldPreview({ userState }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const justSelected = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchApi = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api.clearout.io/public/companies/autocomplete?query=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const apiResults: Suggestion[] = json.data.map((c: ClearoutCompany) => ({
            name: c.name,
            logo: c.logo_url,
            source: 'api' as const,
          }));

          // Merge with local matches
          const localMatches = EMPLOYERS
            .filter(e => fuzzyMatch(q, e.name))
            .map(e => ({
              employer: e,
              score: scoreLocalMatch(q, e, userState || null),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(m => ({
              name: m.employer.name,
              source: 'local' as const,
              industry: m.employer.industry,
              nearYou: userState ? m.employer.state === userState.toUpperCase() : false,
            }));

          // Dedupe: local names take priority
          const localNames = new Set(localMatches.map(m => m.name.toLowerCase()));
          const dedupedApi = apiResults.filter(a => !localNames.has(a.name.toLowerCase()));

          setSuggestions([...localMatches, ...dedupedApi].slice(0, 8));
        }
      } catch {
        // API failed, just use local
      } finally {
        setLoading(false);
      }
    }, 300),
    [userState]
  );

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (!selected && query.length >= 2) {
      // Show local results immediately
      const localMatches = EMPLOYERS
        .filter(e => fuzzyMatch(query, e.name))
        .map(e => ({
          employer: e,
          score: scoreLocalMatch(query, e, userState || null),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(m => ({
          name: m.employer.name,
          source: 'local' as const,
          industry: m.employer.industry,
          nearYou: userState ? m.employer.state === userState.toUpperCase() : false,
        }));
      setSuggestions(localMatches);

      // Then fetch API results
      searchApi(query);
    } else {
      setSuggestions([]);
    }
  }, [query, selected, userState, searchApi]);

  const handleSelect = (name: string) => {
    justSelected.current = true;
    setQuery(name);
    setSuggestions([]);
    setSelected(true);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setSelected(false);
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    paddingLeft: 36,
    fontSize: 15,
    outline: 'none',
    transition: 'all 0.2s',
    color: '#111827',
    border: `2px solid ${focused ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: 8,
    background: '#fff',
  };

  return (
    <div style={{ padding: '20px 16px', background: '#fff', borderRadius: 8, minHeight: 100, position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        Employer Name
      </label>

      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 15, pointerEvents: 'none' }}>
          🏢
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => setFocused(false), 200); }}
          placeholder="Start typing your employer..."
          autoComplete="off"
          style={fieldStyle}
        />
        {loading && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 12 }}>
            ...
          </span>
        )}

        {suggestions.length > 0 && focused && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            marginTop: 4, overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            {suggestions.map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                onMouseDown={ev => { ev.preventDefault(); handleSelect(s.name); }}
                style={{
                  padding: '10px 12px', fontSize: 14, cursor: 'pointer',
                  color: '#374151',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = '#f0f7ff')}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {s.logo ? (
                    <img
                      src={s.logo}
                      alt=""
                      style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain', background: '#f9fafb' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: 14, width: 24, textAlign: 'center' }}>🏢</span>
                  )}
                  <span>{s.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {s.industry && (
                    <span style={{
                      fontSize: 11, color: '#9ca3af', background: '#f3f4f6',
                      padding: '2px 6px', borderRadius: 4,
                    }}>
                      {s.industry}
                    </span>
                  )}
                  {s.nearYou && (
                    <span style={{
                      fontSize: 11, color: '#3b82f6', background: '#eff6ff',
                      padding: '2px 6px', borderRadius: 4,
                    }}>
                      Near you
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div style={{
              padding: '8px 12px', fontSize: 12, color: '#9ca3af',
              background: '#f9fafb', borderTop: '1px solid #f3f4f6',
            }}>
              Don't see your employer? Just type the full name.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
