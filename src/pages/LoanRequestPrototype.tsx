import { useState, useRef, useEffect, useCallback } from 'react';

const MIN = 500;
const MAX = 5000;
const STEP = 100;
const QUICK_AMOUNTS = [500, 1000, 2000, 3000, 5000];

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function LoanRequestPrototype() {
  const [amount, setAmount] = useState(2000);
  const [inputValue, setInputValue] = useState('2,000');
  const [dragging, setDragging] = useState(false);
  const [showHigherModal, setShowHigherModal] = useState(false);
  const [higherAmount, setHigherAmount] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleHigherAmountChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits === '') { setHigherAmount(''); return; }
    setHigherAmount(parseInt(digits, 10).toLocaleString('en-US'));
  };

  const closeModal = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setShowHigherModal(false);
  }, []);

  const percentage = ((amount - MIN) / (MAX - MIN)) * 100;

  const updateAmount = (val: number) => {
    const clamped = clamp(Math.round(val / STEP) * STEP, MIN, MAX);
    setAmount(clamped);
    setInputValue(formatCurrency(clamped));
  };

  const handleSliderInteraction = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateAmount(MIN + pct * (MAX - MIN));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleSliderInteraction(clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits === '') {
      setInputValue('');
      return;
    }
    const num = parseInt(digits, 10);
    setInputValue(formatCurrency(num));
  };

  const handleInputBlur = () => {
    const digits = inputValue.replace(/[^\d]/g, '');
    const num = parseInt(digits, 10) || MIN;
    updateAmount(num);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 24,
    }}>
      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      {/* Progress bar — flush to top */}
      <div style={{
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: 500,
          margin: '0 auto',
          paddingTop: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Step 1 of 5</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Loan Amount</span>
          </div>
          <div style={{
            height: 3,
            background: '#f1f5f9',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: '20%',
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              borderRadius: 2,
            }} />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        padding: '24px 20px 0',
        boxSizing: 'border-box',
      }}>
        {/* Heading */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#0f172a',
          textAlign: 'center',
          margin: '0 0 4px',
          lineHeight: 1.3,
        }}>
          Get your funds as soon as tomorrow
        </h1>
        <p style={{
          fontSize: 14,
          color: '#64748b',
          textAlign: 'center',
          margin: '0 0 28px',
        }}>
          Quick and easy — just pick an amount
        </p>

        {/* Amount display */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 300,
            color: '#94a3b8',
          }}>$</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#0f172a',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: 180,
              textAlign: 'center',
              fontFamily: 'inherit',
              caretColor: '#3b82f6',
            }}
          />
        </div>

        {/* Slider */}
        <div style={{ marginBottom: 28 }}>
          <div
            ref={sliderRef}
            onMouseDown={e => { setDragging(true); handleSliderInteraction(e.clientX); }}
            onTouchStart={e => { setDragging(true); handleSliderInteraction(e.touches[0].clientX); }}
            style={{
              position: 'relative',
              height: 48,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              touchAction: 'none',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              height: 6,
              background: '#f1f5f9',
              borderRadius: 3,
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              width: `${percentage}%`,
              height: 6,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              borderRadius: 3,
              transition: dragging ? 'none' : 'width 0.15s',
            }} />
            <div style={{
              position: 'absolute',
              left: `${percentage}%`,
              transform: 'translateX(-50%)',
              width: 32,
              height: 32,
              background: '#3b82f6',
              borderRadius: '50%',
              boxShadow: '0 2px 10px rgba(59,130,246,0.4)',
              transition: dragging ? 'none' : 'left 0.15s',
              zIndex: 2,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>$500</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>$5,000</span>
          </div>
        </div>

        {/* Quick select chips */}
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            marginBottom: 20,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => updateAmount(amt)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: amount === amt ? '#fff' : '#374151',
                background: amount === amt
                  ? '#3b82f6'
                  : '#f8fafc',
                border: amount === amt ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                borderRadius: 100,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minHeight: 44,
              }}
            >
              ${formatCurrency(amt)}
            </button>
          ))}
        </div>

        {/* Higher amount link */}
        <div
          onClick={() => setShowHigherModal(true)}
          style={{
            textAlign: 'center',
            padding: '12px 0',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 14, color: '#3b82f6', fontWeight: 500 }}>
            Need more than $5,000?
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginLeft: 4 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* CTA — sticky to bottom, sits below "Need more" naturally */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          padding: '12px 0 max(12px, env(safe-area-inset-bottom))',
          zIndex: 10,
        }}>
          <button
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              minHeight: 52,
            }}
          >
            Continue
          </button>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 8,
          }}>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              No paperwork
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              2 min
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg>
              Fast funding
            </span>
          </div>
          <p style={{ fontSize: 10, color: '#c0c7cf', lineHeight: 1.5, margin: '6px 0 0', textAlign: 'center' }}>
            APR 5.99%–35.99% | 91 days–72 months |{' '}
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Disclosures</a>
          </p>
        </div>
      </div>

      {/* Higher Amount Modal — bottom sheet */}
      {showHigherModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px max(24px, env(safe-area-inset-bottom))',
            width: '100%',
            maxWidth: 500,
            position: 'relative',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}>
            {/* Drag handle */}
            <div style={{
              width: 36,
              height: 4,
              background: '#d1d5db',
              borderRadius: 2,
              margin: '0 auto 20px',
            }} />

            <button
              onClick={() => setShowHigherModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: 18,
                lineHeight: 1,
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              &times;
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              Extended Loan Program
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Request $5,000–$35,000 with flexible terms.
            </p>

            {/* Amount input */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 22, fontWeight: 300, color: '#94a3b8' }}>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={higherAmount}
                onChange={e => handleHigherAmountChange(e.target.value)}
                placeholder="0"
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#0f172a',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: 160,
                  textAlign: 'center',
                  fontFamily: 'inherit',
                  caretColor: '#3b82f6',
                }}
              />
            </div>

            {/* Quick amounts — horizontal scroll, no scrollbar, fade hint */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <div
                className="hide-scrollbar"
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 2,
                  WebkitOverflowScrolling: 'touch',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                }}
              >
                {[5000, 10000, 15000, 25000, 35000].map(amt => {
                  const isSelected = higherAmount === amt.toLocaleString('en-US');
                  return (
                    <button
                      key={amt}
                      onClick={() => setHigherAmount(amt.toLocaleString('en-US'))}
                      style={{
                        padding: '10px 20px',
                        fontSize: 14,
                        fontWeight: 600,
                        color: isSelected ? '#fff' : '#374151',
                        background: isSelected ? '#3b82f6' : '#f8fafc',
                        border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                        borderRadius: 100,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minHeight: 44,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      ${amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  );
                })}
              </div>
              {/* Fade hint on the right edge */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 2,
                width: 40,
                background: 'linear-gradient(to right, transparent, #fff)',
                pointerEvents: 'none',
              }} />
            </div>

            <button
              disabled={!higherAmount}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 17,
                fontWeight: 700,
                color: '#fff',
                background: higherAmount ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#cbd5e1',
                border: 'none',
                borderRadius: 14,
                cursor: higherAmount ? 'pointer' : 'not-allowed',
                boxShadow: higherAmount ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s',
                minHeight: 52,
              }}
            >
              Continue with ${higherAmount || '...'}
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
              Same fast process. Results in minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
