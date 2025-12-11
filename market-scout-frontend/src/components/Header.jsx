import { StoreIcon, TrophyIcon, UserIcon, LogOutIcon, LeafIcon } from './Icons';

/**
 * Header Component
 *
 * Modern glassmorphism header with centered navigation and warm earth tones.
 */
export default function Header({
  user,
  apiConnected,
  activeTab,
  onTabChange,
  onLoginClick,
  onLogout
}) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: StoreIcon },
    { id: 'leaderboard', label: 'Top Rated', icon: TrophyIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon, requiresAuth: true },
  ];

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
      height: 'var(--header-height)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '0 var(--space-8)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            cursor: 'pointer',
          }}
          onClick={() => onTabChange('discover')}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(196, 101, 74, 0.3)',
          }}>
            <LeafIcon size={26} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              lineHeight: 'var(--leading-none)',
            }}>
              Forage
            </h1>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              marginTop: 'var(--space-0-5)',
            }}>
              Artisan Markets
            </div>
          </div>
        </div>

        {/* Center Navigation - Pill Container */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          backgroundColor: 'var(--color-cream-200)',
          padding: 'var(--space-1-5)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border-secondary)',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.requiresAuth && !user;

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2-5) var(--space-5)',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--color-bg-card)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all var(--transition-base)',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  border: 'none',
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Status + User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* API Status - Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: apiConnected ? 'var(--color-sage-100)' : 'var(--color-ochre-100)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: apiConnected ? 'var(--color-sage-600)' : 'var(--color-ochre-700)',
            letterSpacing: 'var(--tracking-wide)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: apiConnected ? 'var(--color-sage-500)' : 'var(--color-ochre-500)',
              animation: 'pulse 2s infinite',
            }} />
            {apiConnected ? 'Live' : 'Demo'}
          </div>

          {/* User Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* User Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-4) var(--space-2) var(--space-2)',
                backgroundColor: 'var(--color-cream-200)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border-secondary)',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(145deg, var(--color-sage-300) 0%, var(--color-sage-400) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-base)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  🌿
                </div>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-semibold)',
                }}>
                  {user.username}
                </span>
              </div>
              {/* Sign Out Button */}
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2-5) var(--space-4)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-cream-200)';
                  e.currentTarget.style.borderColor = 'var(--color-cream-400)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                }}
              >
                <LogOutIcon size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                boxShadow: '0 4px 12px rgba(196, 101, 74, 0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(196, 101, 74, 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 101, 74, 0.25)';
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
