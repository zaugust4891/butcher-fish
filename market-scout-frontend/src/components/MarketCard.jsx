import { useState } from 'react';
import { MARKET_TYPE_COLORS } from '../services/mockData';
import { MapPinIcon, ArrowRightIcon, StarIcon } from './Icons';

/**
 * MarketCard Component
 *
 * Modern bento-style market card with generous padding and layered shadows.
 * Features warm earth tones and smooth hover animations.
 */
export default function MarketCard({ market, rank, onSelect, isSelected }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = MARKET_TYPE_COLORS[market.type] || MARKET_TYPE_COLORS.default;

  // Rank medal colors
  const getRankStyle = () => {
    if (rank === 1) return { bg: 'linear-gradient(145deg, #D4A853 0%, #C28E3A 100%)', emoji: '🥇' };
    if (rank === 2) return { bg: 'linear-gradient(145deg, #A89B8C 0%, #8A7D6F 100%)', emoji: '🥈' };
    if (rank === 3) return { bg: 'linear-gradient(145deg, #C4654A 0%, #B05640 100%)', emoji: '🥉' };
    return { bg: 'var(--color-brown-800)', emoji: null };
  };

  const rankStyle = getRankStyle();

  return (
    <article
      onClick={() => onSelect(market)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all var(--transition-slow)',
        border: isSelected
          ? '2px solid var(--color-primary)'
          : '1px solid var(--color-border-secondary)',
        boxShadow: isSelected
          ? 'var(--shadow-card-active)'
          : isHovered
            ? 'var(--shadow-card-hover)'
            : 'var(--shadow-card)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(market)}
    >
      {/* Header Section with Gradient Background */}
      <div style={{
        position: 'relative',
        height: rank ? '80px' : '100px',
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent}20 100%)`,
        overflow: 'hidden',
      }}>
        {/* Subtle dot pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />

        {/* Rank Badge */}
        {rank && (
          <div style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            background: rankStyle.bg,
            color: 'white',
            fontWeight: 'var(--font-bold)',
            fontSize: 'var(--text-sm)',
            boxShadow: 'var(--shadow-md)',
          }}>
            {rankStyle.emoji || `#${rank}`}
            {rank <= 3 && <span>Rank {rank}</span>}
            {rank > 3 && <span>#{rank}</span>}
          </div>
        )}

        {/* Score Badge - Pill Style */}
        {market.score !== undefined && (
          <div style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1-5)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-md)',
          }}>
            <StarIcon size={14} filled />
            <span style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-ochre-600)',
            }}>
              {market.score.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Generous Padding */}
      <div style={{ padding: 'var(--space-6)' }}>
        {/* Category Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: 'var(--space-1-5) var(--space-3)',
          borderRadius: 'var(--radius-full)',
          backgroundColor: colors.bg,
          color: colors.accent,
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          marginBottom: 'var(--space-4)',
        }}>
          {market.type}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
              lineHeight: 'var(--leading-tight)',
            }}>
              {market.name}
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
            }}>
              <MapPinIcon size={16} />
              <span>{market.address}</span>
            </div>
          </div>

          {/* Action Button */}
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: isSelected || isHovered
              ? 'var(--color-primary)'
              : 'var(--color-cream-200)',
            color: isSelected || isHovered
              ? 'white'
              : 'var(--color-text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-base)',
            flexShrink: 0,
            boxShadow: isSelected || isHovered ? 'var(--glow-primary)' : 'none',
          }}>
            <ArrowRightIcon size={20} />
          </div>
        </div>
      </div>
    </article>
  );
}
