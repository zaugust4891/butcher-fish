import { useState } from 'react';
import { CloseIcon, LeafIcon } from './Icons';

/**
 * AuthModal Component
 *
 * Modern bento-style auth modal with warm earth tones and large radius.
 */
export default function AuthModal({ onLogin, onRegister, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'register') {
      const result = await onRegister(form.username, form.email, form.password);
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Registration successful! Check your email to verify.'
        });
        if (!result.mock) {
          setMode('login');
        } else {
          setTimeout(() => onClose(), 1500);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Registration failed' });
      }
    } else {
      const result = await onLogin(form.username, form.password);
      if (result.success) {
        if (result.mock) {
          setMessage({ type: 'success', text: 'Logged in (Demo mode)' });
          setTimeout(() => onClose(), 500);
        } else {
          onClose();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Login failed' });
      }
    }
    setLoading(false);
  };

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getInputStyle = (field) => ({
    width: '100%',
    padding: 'var(--space-4) var(--space-5)',
    borderRadius: 'var(--radius-xl)',
    border: `2px solid ${focusedField === field ? 'var(--color-terracotta-400)' : 'var(--color-border-primary)'}`,
    fontSize: 'var(--text-base)',
    backgroundColor: focusedField === field ? 'var(--color-bg-card)' : 'var(--color-cream-100)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'all var(--transition-base)',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(196, 101, 74, 0.1)' : 'none',
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
          maxWidth: '440px',
          boxShadow: 'var(--shadow-2xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="slide-up"
      >
        {/* Modern Header with Gradient */}
        <div style={{
          background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)',
          padding: 'var(--space-10) var(--space-8) var(--space-8)',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Subtle pattern overlay */}
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
            <LeafIcon size={36} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'white',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-2)',
            position: 'relative',
          }}>
            {mode === 'login' ? 'Welcome Back' : 'Join Forage'}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'var(--text-base)',
            position: 'relative',
          }}>
            {mode === 'login'
              ? 'Sign in to continue your journey'
              : 'Create your account today'
            }
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
          {message && (
            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: 'var(--space-5)',
              backgroundColor: message.type === 'success' ? 'var(--color-sage-100)' : 'var(--color-terracotta-100)',
              color: message.type === 'success' ? 'var(--color-sage-700)' : 'var(--color-terracotta-700)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => updateForm('username', e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('username')}
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle('email')}
                    required
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder={mode === 'register' ? 'Create a password (min 8 chars)' : 'Enter your password'}
                  value={form.password}
                  onChange={e => updateForm('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle('password')}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-4) var(--space-6)',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)',
                  color: 'white',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all var(--transition-base)',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(196, 101, 74, 0.25)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(196, 101, 74, 0.35)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 101, 74, 0.25)';
                }}
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border-secondary)',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
            }}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary)'}
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
