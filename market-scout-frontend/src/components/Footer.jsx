import { LeafIcon } from './Icons';

/**
 * Footer Component
 *
 * Modern minimal footer with warm earth tones.
 */
export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-espresso-900)',
      color: 'var(--color-cream-400)',
      marginTop: 'var(--space-24)',
    }}>
      {/* Main Footer Content */}
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'var(--space-16) var(--space-8)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-12)',
        }}>
          {/* Brand Column */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-5)',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <LeafIcon size={22} />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-cream-100)',
              }}>
                Forage
              </span>
            </div>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-cream-500)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '320px',
            }}>
              Discover and review the finest specialty food markets.
              Your guide to artisanal and gourmet culinary experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-widest)',
              color: 'var(--color-cream-300)',
              marginBottom: 'var(--space-5)',
            }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none' }}>
              {['Discover Markets', 'Top Rated', 'Write a Review', 'About Us'].map(link => (
                <li key={link} style={{ marginBottom: 'var(--space-3)' }}>
                  <a
                    href="#"
                    style={{
                      color: 'var(--color-cream-500)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-sm)',
                      transition: 'color var(--transition-base)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-terracotta-400)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-cream-500)'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* API Status */}
          <div>
            <h4 style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-widest)',
              color: 'var(--color-cream-300)',
              marginBottom: 'var(--space-5)',
            }}>
              For Developers
            </h4>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-cream-500)',
              marginBottom: 'var(--space-4)',
            }}>
              Built with Flask + React
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-espresso-800)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-cream-400)',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-sage-500)',
              }} />
              API v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid var(--color-espresso-700)',
        padding: 'var(--space-6) var(--space-8)',
      }}>
        <div style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-cream-600)',
        }}>
          <div>
            © {new Date().getFullYear()} Forage. Crafted with care for food lovers.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a
                key={link}
                href="#"
                style={{
                  color: 'var(--color-cream-600)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-cream-300)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-cream-600)'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
