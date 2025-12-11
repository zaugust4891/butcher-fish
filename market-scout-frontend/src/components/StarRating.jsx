import { useState } from 'react';
import { StarIcon } from './Icons';

/**
 * StarRating Component
 *
 * Modern interactive star rating with terracotta accent and bounce animation.
 */
export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = 28
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = !!onChange && !readonly;

  const getStarColor = (star) => {
    const activeRating = hoverRating || rating;
    if (star <= activeRating) {
      return 'var(--color-terracotta-500)';
    }
    return 'var(--color-cream-400)';
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: isInteractive ? 'var(--color-cream-100)' : 'transparent',
      }}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => isInteractive && setHoverRating(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: isInteractive ? 'pointer' : 'default',
            color: getStarColor(star),
            transition: 'all var(--transition-bounce)',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-md)',
            transform: (hoverRating >= star && isInteractive) ? 'scale(1.2)' : 'scale(1)',
            filter: (hoverRating >= star && isInteractive) ? 'drop-shadow(0 3px 6px rgba(196, 101, 74, 0.35))' : 'none',
          }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <StarIcon
            filled={star <= (hoverRating || rating)}
            size={size}
          />
        </button>
      ))}

      {/* Rating Label - Pill Style */}
      {isInteractive && (
        <span style={{
          marginLeft: 'var(--space-3)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: (hoverRating || rating) > 0 ? 'var(--color-terracotta-600)' : 'var(--color-text-muted)',
          minWidth: '70px',
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-1) var(--space-3)',
          backgroundColor: (hoverRating || rating) > 0 ? 'var(--color-terracotta-100)' : 'transparent',
          borderRadius: 'var(--radius-full)',
          transition: 'all var(--transition-base)',
        }}>
          {(hoverRating || rating) > 0
            ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || rating]
            : 'Rate'
          }
        </span>
      )}
    </div>
  );
}
