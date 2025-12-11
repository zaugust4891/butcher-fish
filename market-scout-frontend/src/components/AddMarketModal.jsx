import { useState } from 'react';
import { CloseIcon, StoreIcon } from './Icons';
import { useMarketCreate } from '../hooks/useApi';

/**
 * AddMarketModal Component
 *
 * Modal for adding new markets to the platform.
 * Follows the same design patterns as AuthModal.
 */
export default function AddMarketModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', address: '', type: '' });
  const [focusedField, setFocusedField] = useState(null);
  const { createMarket, submitting, result } = useMarketCreate();

  const marketTypes = [
    { value: 'farmers_market', label: 'Farmers Market' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'butcher', label: 'Butcher Shop' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'deli', label: 'Deli' },
    { value: 'specialty', label: 'Specialty Store' },
    { value: 'organic', label: 'Organic Market' },
    { value: 'seafood', label: 'Seafood Market' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.type) return;

    const response = await createMarket(form.name, form.address, form.type);
    if (response.success) {
      setForm({ name: '', address: '', type: '' });
      onSuccess?.();
      setTimeout(() => onClose(), 1500);
    }
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.length >= 2 && form.address.length >= 5 && form.type;

  const getInputStyle = (field) => ({
    width: '100%',
    padding: 'var(--space-4) var(--space-5)',
    borderRadius: 'var(--radius-xl)',
    border: `2px solid ${focusedField === field ? 'var(--color-sage-400)' : 'var(--color-border-primary)'}`,
    fontSize: 'var(--text-base)',
    backgroundColor: focusedField === field ? 'var(--color-bg-card)' : 'var(--color-cream-100)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'all var(--transition-base)',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(125, 145, 105, 0.1)' : 'none',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal-backdrop)',
        padding: 'var(--space-6)',
      }}
      className="fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-3xl)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-2xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="slide-up"
      >
        {/* Header with Gradient */}
        <div style={{
          background: 'linear-gradient(145deg, var(--color-sage-400) 0%, var(--color-sage-500) 100%)',
          padding: 'var(--space-10) var(--space-8) var(--space-8)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />

          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-2xl)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-5)',
            color: 'white',
            position: 'relative',
          }}>
            <StoreIcon size={36} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'white',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-2)',
            position: 'relative',
          }}>
            Add New Market
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'var(--text-base)',
            position: 'relative',
          }}>
            Share a new market with the community
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-5)',
            right: 'var(--space-5)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-base)',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          aria-label="Close"
        >
          <CloseIcon size={20} />
        </button>

        {/* Form Content */}
        <div style={{ padding: 'var(--space-8)' }}>
          {result && (
            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: 'var(--space-5)',
              backgroundColor: result.success ? 'var(--color-sage-100)' : 'var(--color-terracotta-100)',
              color: result.success ? 'var(--color-sage-700)' : 'var(--color-terracotta-700)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
            }}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label style={labelStyle}>Market Name</label>
                <input
                  type="text"
                  placeholder="e.g., Green Valley Farmers Market"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('name')}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  placeholder="e.g., 123 Main St, Portland, OR"
                  value={form.address}
                  onChange={e => updateForm('address', e.target.value)}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('address')}
                  required
                  minLength={5}
                  maxLength={255}
                />
              </div>

              <div>
                <label style={labelStyle}>Market Type</label>
                <select
                  value={form.type}
                  onChange={e => updateForm('type', e.target.value)}
                  onFocus={() => setFocusedField('type')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...getInputStyle('type'),
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    backgroundSize: '20px',
                    paddingRight: 'var(--space-12)',
                  }}
                  required
                >
                  <option value="">Select a type...</option>
                  {marketTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !isValid}
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-4) var(--space-6)',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isValid
                    ? 'linear-gradient(145deg, var(--color-sage-400) 0%, var(--color-sage-500) 100%)'
                    : 'var(--color-cream-300)',
                  color: isValid ? 'white' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: (submitting || !isValid) ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: isValid ? '0 4px 12px rgba(125, 145, 105, 0.25)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!submitting && isValid) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(125, 145, 105, 0.35)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isValid ? '0 4px 12px rgba(125, 145, 105, 0.25)' : 'none';
                }}
              >
                {submitting ? 'Adding Market...' : 'Add Market'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

