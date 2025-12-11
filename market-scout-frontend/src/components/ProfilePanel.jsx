import { useState } from 'react';
import { UserIcon, CheckIcon, HeartIcon, EditIcon } from './Icons';
import { MOCK_FOLLOWING, MOCK_FOLLOWED_MARKETS } from '../services/mockData';

/**
 * ProfilePanel Component
 *
 * Modern bento-style profile with warm earth tones.
 */
export default function ProfilePanel({ user }) {
  const [following] = useState(MOCK_FOLLOWING);
  const [followedMarkets] = useState(MOCK_FOLLOWED_MARKETS);

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-3xl)',
      overflow: 'hidden',
      border: '1px solid var(--color-border-secondary)',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Profile Header with Gradient */}
      <div style={{
        position: 'relative',
        height: '140px',
        background: 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 50%, var(--color-terracotta-600) 100%)',
      }}>
        {/* Decorative Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        {/* Edit Button - Pill Style */}
        <button style={{
          position: 'absolute',
          top: 'var(--space-4)',
          right: 'var(--space-4)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          border: 'none',
          color: 'white',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          transition: 'all var(--transition-base)',
        }}>
          <EditIcon size={14} />
          Edit
        </button>

        {/* Avatar - Large with Shadow */}
        <div style={{
          position: 'absolute',
          bottom: '-56px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '112px',
          height: '112px',
          borderRadius: 'var(--radius-2xl)',
          backgroundColor: 'var(--color-bg-card)',
          border: '4px solid var(--color-bg-card)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}>
          🧑‍🍳
        </div>
      </div>

      <div style={{ padding: '72px var(--space-8) var(--space-8)' }}>
        {/* User Info - Centered */}
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-2)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
            }}>
              {user.username}
            </h3>
            {user.email_verified && (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-sage-500)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckIcon size={14} />
              </div>
            )}
          </div>

          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
          }}>
            {user.email}
          </p>
        </div>

        {/* Stats Grid - Card Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}>
          {[
            { value: following.length, label: 'Following', color: 'var(--color-terracotta-100)' },
            { value: 12, label: 'Followers', color: 'var(--color-sage-100)' },
            { value: followedMarkets.length, label: 'Markets', color: 'var(--color-ochre-100)' },
          ].map(stat => (
            <div key={stat.label} style={{
              textAlign: 'center',
              padding: 'var(--space-5) var(--space-3)',
              backgroundColor: stat.color,
              borderRadius: 'var(--radius-xl)',
            }}>
              <div style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
                marginTop: 'var(--space-2)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Following List */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
            marginBottom: 'var(--space-4)',
          }}>
            People You Follow
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
            {following.map(person => (
              <div
                key={person.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-cream-100)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(145deg, var(--color-sage-200) 0%, var(--color-sage-300) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-sage-600)',
                }}>
                  <UserIcon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {person.displayName}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}>
                    @{person.username}
                  </div>
                </div>
                <div style={{
                  color: 'var(--color-terracotta-400)',
                }}>
                  <HeartIcon size={18} filled />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div style={{
          padding: 'var(--space-5)',
          background: 'linear-gradient(145deg, var(--color-ochre-100) 0%, var(--color-ochre-200) 100%)',
          borderRadius: 'var(--radius-xl)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-espresso-700)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
        }}>
          <span style={{ fontSize: 'var(--text-xl)' }}>✨</span>
          <div>
            <strong style={{ color: 'var(--color-ochre-700)' }}>Coming Soon</strong>
            <p style={{ marginTop: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)' }}>
              Activity feed, personalized recommendations, and review reactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
