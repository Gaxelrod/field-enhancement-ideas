import { useState, useCallback, useRef, useEffect } from 'react';
import { EMPLOYERS } from '../data/employers';

const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;
const AWS_REGION = 'us-west-2';

interface ClearoutCompany {
  name: string;
  domain: string;
  confidence_score: number;
  logo_url: string;
}

interface EmployerSuggestion {
  name: string;
  logo?: string;
  industry?: string;
  source: 'local' | 'api';
}

interface NearbyResult {
  PlaceId: string;
  Title: string;
  Address?: {
    Label?: string;
    Street?: string;
    Locality?: string;
    Region?: string;
    PostalCode?: string;
  };
  PhoneNumber?: string;
  Distance?: number;
  Position?: [number, number];
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
  return n.includes(q) || n.split(/\s+/).some(w => w.startsWith(q));
}

export function StoreLocatorPrototype() {
  const [zip, setZip] = useState('');
  const [employerQuery, setEmployerQuery] = useState('');
  const [employerSuggestions, setEmployerSuggestions] = useState<EmployerSuggestion[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<string | null>(null);
  const [employerFocused, setEmployerFocused] = useState(false);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<NearbyResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<NearbyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const justSelected = useRef(false);

  // Clearout API search (debounced)
  const searchClearout = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) return;
      setEmployerLoading(true);
      try {
        const res = await fetch(`https://api.clearout.io/public/companies/autocomplete?query=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const apiResults: EmployerSuggestion[] = json.data.map((c: ClearoutCompany) => ({
            name: c.name,
            logo: c.logo_url,
            source: 'api' as const,
          }));

          // Merge: local first, then API (deduped)
          const localMatches = EMPLOYERS
            .filter(e => fuzzyMatch(q, e.name))
            .slice(0, 3)
            .map(e => ({
              name: e.name,
              industry: e.industry,
              source: 'local' as const,
            }));

          const localNames = new Set(localMatches.map(m => m.name.toLowerCase()));
          const dedupedApi = apiResults.filter(a => !localNames.has(a.name.toLowerCase()));

          setEmployerSuggestions([...localMatches, ...dedupedApi].slice(0, 8));
        }
      } catch {
        // API failed, keep local results
      } finally {
        setEmployerLoading(false);
      }
    }, 300),
    []
  );

  // Employer autocomplete — local instant + API
  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (!selectedEmployer && employerQuery.length >= 2) {
      const localMatches = EMPLOYERS
        .filter(e => fuzzyMatch(employerQuery, e.name))
        .slice(0, 4)
        .map(e => ({
          name: e.name,
          industry: e.industry,
          source: 'local' as const,
        }));
      setEmployerSuggestions(localMatches);
      searchClearout(employerQuery);
    } else {
      setEmployerSuggestions([]);
    }
  }, [employerQuery, selectedEmployer, searchClearout]);

  const handleEmployerChange = (value: string) => {
    setEmployerQuery(value);
    setSelectedEmployer(null);
    setNearbyResults([]);
    setSelectedLocation(null);
    justSelected.current = false;
  };

  const handleEmployerSelect = (name: string) => {
    justSelected.current = true;
    setEmployerQuery(name);
    setSelectedEmployer(name);
    setEmployerSuggestions([]);
  };

  // Geocode zip to coordinates, then search nearby
  const searchNearby = useCallback(
    debounce(async (zipCode: string, employer: string) => {
      if (!zipCode || zipCode.length < 5 || !employer) return;
      setLoading(true);
      setError('');
      setNearbyResults([]);
      setSelectedLocation(null);

      try {
        // First: geocode the zip code to get coordinates
        const geocodeRes = await fetch(
          `https://places.geo.${AWS_REGION}.amazonaws.com/v2/geocode?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              QueryText: zipCode,
              Filter: { IncludeCountries: ['USA'] },
              MaxResults: 1,
            }),
          }
        );
        const geocodeData = await geocodeRes.json();
        console.log('Geocode response:', geocodeData);

        const position = geocodeData.ResultItems?.[0]?.Position;
        if (!position) {
          setError('Could not find that zip code');
          setLoading(false);
          return;
        }

        // Second: search text for the employer near that position
        const nearbyRes = await fetch(
          `https://places.geo.${AWS_REGION}.amazonaws.com/v2/search-text?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              QueryText: employer,
              BiasPosition: position,
              MaxResults: 5,
              AdditionalFeatures: ['Contact'],
              Filter: {
                IncludeCountries: ['USA'],
              },
            }),
          }
        );
        const nearbyData = await nearbyRes.json();
        console.log('SearchText response:', nearbyData);

        const allItems = nearbyData.ResultItems || [];
        // Filter to only results that actually match the employer name
        const noiseWords = new Set(['inc', 'llc', 'corp', 'ltd', 'co', 'the', 'and', 'group', 'company', 'services']);
        const employerWords = employer.toLowerCase().replace(/[,.\s]+/g, ' ').trim().split(/\s+/).filter(w => w.length > 2 && !noiseWords.has(w));
        const items = allItems.filter((r: NearbyResult) => {
          const title = (r.Title || '').toLowerCase();
          // At least one significant word from the employer name must appear in the result title
          return employerWords.some(w => title.includes(w));
        });

        if (items.length === 0) {
          setError(`No "${employer}" locations found near ${zipCode}`);
        } else {
          setNearbyResults(items);
          if (items.length === 1) {
            setSelectedLocation(items[0]);
          }
        }
      } catch (e) {
        console.error('Search failed:', e);
        setError('Search failed — check console for details');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = () => {
    if (zip.length >= 5 && selectedEmployer) {
      searchNearby(zip, selectedEmployer);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    fontSize: 15,
    outline: 'none',
    color: '#111827',
    border: '2px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
            Employer Store Locator
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Find the nearest location + phone number for an employer
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible',
          padding: '20px 16px',
        }}>
          {/* Zip code */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Your Zip Code
            </label>
            <input
              type="text"
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="e.g. 90210"
              style={fieldStyle}
              maxLength={5}
            />
          </div>

          {/* Employer */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Employer Name
            </label>
            <input
              type="text"
              value={employerQuery}
              onChange={e => handleEmployerChange(e.target.value)}
              onFocus={() => setEmployerFocused(true)}
              onBlur={() => setTimeout(() => setEmployerFocused(false), 200)}
              placeholder="e.g. Best Buy"
              autoComplete="off"
              style={{
                ...fieldStyle,
                borderColor: selectedEmployer ? '#22c55e' : '#d1d5db',
              }}
            />
            {selectedEmployer && (
              <span style={{ position: 'absolute', right: 12, top: 38, color: '#22c55e', fontSize: 16 }}>✓</span>
            )}
            {employerLoading && (
              <span style={{ position: 'absolute', right: selectedEmployer ? 32 : 12, top: 38, color: '#9ca3af', fontSize: 12 }}>...</span>
            )}

            {/* Employer suggestions */}
            {employerSuggestions.length > 0 && employerFocused && !justSelected.current && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                marginTop: 4, overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                {employerSuggestions.map((s, i) => (
                  <div
                    key={`${s.name}-${i}`}
                    onMouseDown={ev => { ev.preventDefault(); handleEmployerSelect(s.name); }}
                    style={{
                      padding: '10px 12px', fontSize: 14, cursor: 'pointer',
                      color: '#374151',
                      borderBottom: i < employerSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
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
                    {s.industry && (
                      <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                        {s.industry}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={zip.length < 5 || !selectedEmployer || loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              background: zip.length >= 5 && selectedEmployer ? '#3b82f6' : '#94a3b8',
              border: 'none',
              borderRadius: 8,
              cursor: zip.length >= 5 && selectedEmployer ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Searching...' : 'Find Nearest Location'}
          </button>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Results */}
          {nearbyResults.length > 1 && !selectedLocation && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                {nearbyResults.length} locations found — select one:
              </div>
              {nearbyResults.map((r, i) => (
                <div
                  key={r.PlaceId || i}
                  onClick={() => setSelectedLocation(r)}
                  style={{
                    padding: 12, borderRadius: 8, cursor: 'pointer',
                    border: '1px solid #e5e7eb', marginBottom: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f0f7ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.Title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    {r.Address?.Label || 'Address unavailable'}
                  </div>
                  {r.Distance != null && (
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {(r.Distance / 1000).toFixed(1)} km away
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected location detail */}
          {selectedLocation && (
            <div style={{
              marginTop: 16, padding: 16, background: '#f0fdf4',
              borderRadius: 12, border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Selected Location
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                {selectedLocation.Title}
              </div>
              <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>
                {selectedLocation.Address?.Label || 'Address unavailable'}
              </div>
              {selectedLocation.PhoneNumber && (
                <div style={{ fontSize: 14, color: '#3b82f6', marginTop: 6, fontWeight: 500 }}>
                  Phone: {selectedLocation.PhoneNumber}
                </div>
              )}
              {!selectedLocation.PhoneNumber && (
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6, fontStyle: 'italic' }}>
                  No phone number available
                </div>
              )}
              {selectedLocation.Distance != null && (
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {(selectedLocation.Distance / 1000).toFixed(1)} km from {zip}
                </div>
              )}
              {nearbyResults.length > 1 && (
                <button
                  onClick={() => setSelectedLocation(null)}
                  style={{
                    marginTop: 10, padding: '6px 12px', fontSize: 12,
                    background: 'none', border: '1px solid #d1d5db', borderRadius: 6,
                    color: '#6b7280', cursor: 'pointer',
                  }}
                >
                  Choose a different location
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: '#475569' }}>
            Powered by AWS Location Service + Clearout.io
          </p>
        </div>
      </div>
    </div>
  );
}
