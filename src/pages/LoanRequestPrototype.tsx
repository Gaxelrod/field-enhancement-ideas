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
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleSliderInteraction(clientX);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
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
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px',
    }}>
      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        marginTop: 32,
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Step 1 of 5</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Loan Amount</span>
        </div>
        <div style={{
          height: 4,
          background: '#334155',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '20%',
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Main card */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        marginTop: 24,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        padding: '40px 32px 32px',
      }}>
        {/* Heading */}
        <h1 style={{
          fontSize: 26,
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
          margin: '0 0 32px',
        }}>
          Quick and easy — just pick an amount to get started
        </p>

        {/* Amount display + input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: 16,
            padding: '16px 24px',
            width: '100%',
            maxWidth: 320,
            transition: 'border-color 0.2s',
          }}>
            <span style={{
              fontSize: 32,
              fontWeight: 300,
              color: '#94a3b8',
              marginRight: 4,
            }}>$</span>
            <input
              type="text"
              value={inputValue}
              onChange={e => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#0f172a',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Slider */}
        <div style={{ padding: '0 8px', marginBottom: 28 }}>
          <div
            ref={sliderRef}
            onMouseDown={e => { setDragging(true); handleSliderInteraction(e.clientX); }}
            onTouchStart={e => { setDragging(true); handleSliderInteraction(e.touches[0].clientX); }}
            style={{
              position: 'relative',
              height: 40,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Track background */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              height: 8,
              background: '#e2e8f0',
              borderRadius: 4,
            }} />
            {/* Track fill */}
            <div style={{
              position: 'absolute',
              left: 0,
              width: `${percentage}%`,
              height: 8,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
              borderRadius: 4,
              transition: dragging ? 'none' : 'width 0.15s',
            }} />
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              left: `${percentage}%`,
              transform: 'translateX(-50%)',
              width: 28,
              height: 28,
              background: '#fff',
              border: '3px solid #3b82f6',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              transition: dragging ? 'none' : 'left 0.15s',
              zIndex: 2,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>$500</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>$5,000</span>
          </div>
        </div>

        {/* Quick select */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10, fontWeight: 500 }}>
            Popular amounts
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => updateAmount(amt)}
                style={{
                  flex: '1 1 auto',
                  minWidth: 80,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: amount === amt ? '#fff' : '#374151',
                  background: amount === amt
                    ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                    : '#f1f5f9',
                  border: amount === amt ? 'none' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ${formatCurrency(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Higher amount callout */}
        <div
          onClick={() => setShowHigherModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#f0f7ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            marginBottom: 20,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e0efff')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f0f7ff')}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              Looking for a higher amount?
            </div>
            <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
              Request up to $35,000 with our extended loan program
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* CTA */}
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
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
          }}
        >
          Continue
        </button>

        {/* Trust signals */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            No lengthy paperwork
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Takes about 2 minutes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/>
            </svg>
            Funds as fast as next day
          </div>
        </div>
      </div>

      {/* Fine print */}
      <div style={{
        maxWidth: 600,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 32,
      }}>
        <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, margin: '0 0 4px' }}>
          APR ranges from 5.99% to 35.99% for qualified customers.
          91 day minimum up to 72 month maximum repayment period.
        </p>
        <a href="#" style={{ fontSize: 11, color: '#6366f1', textDecoration: 'none' }}>
          Disclosures
        </a>
      </div>

      {/* Higher Amount Modal */}
      {showHigherModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16,
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '32px 28px',
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowHigherModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 20,
                lineHeight: 1,
                padding: 4,
              }}
            >
              &times;
            </button>

            {/* Icon */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Extended Loan Program
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
              Request between $5,000 and $35,000 with competitive rates and flexible repayment terms.
            </p>

            {/* Amount input */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              How much do you need?
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 20, fontWeight: 300, color: '#94a3b8', marginRight: 4 }}>$</span>
              <input
                type="text"
                value={higherAmount}
                onChange={e => handleHigherAmountChange(e.target.value)}
                placeholder="5,000 - 35,000"
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#0f172a',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
              {[5000, 10000, 15000, 25000, 35000].map(amt => {
                const isSelected = higherAmount === amt.toLocaleString('en-US');
                return (
                  <button
                    key={amt}
                    onClick={() => setHigherAmount(amt.toLocaleString('en-US'))}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSelected ? '#fff' : '#374151',
                      background: isSelected ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#f1f5f9',
                      border: isSelected ? 'none' : '1px solid #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ${amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <button
              disabled={!higherAmount}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                background: higherAmount ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#94a3b8',
                border: 'none',
                borderRadius: 12,
                cursor: higherAmount ? 'pointer' : 'not-allowed',
                boxShadow: higherAmount ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Continue with ${higherAmount || '...'}
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12, margin: '12px 0 0' }}>
              Same fast process. Results in minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
