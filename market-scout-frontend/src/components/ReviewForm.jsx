import { useState } from 'react';
import StarRating from './StarRating';
import { useReviewSubmit } from '../hooks/useApi';
import { EditIcon, SparklesIcon, CheckIcon } from './Icons';

/**
 * ReviewForm Component
 *
 * Modern bento-style review form with warm earth tones.
 */
export default function ReviewForm({ market, user, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { submitReview, submitting, result } = useReviewSubmit();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || review.length < 10) return;

    const response = await submitReview(market.id, review, rating);
    if (response.success) {
      setRating(0);
      setReview('');
      onSubmitSuccess?.();
    }
  };

  const isValid = rating > 0 && review.length >= 10;
  const charProgress = Math.min(review.length / 10, 1);

  if (!user) {
    return (
      <div style={{
        padding: 'var(--space-10)',
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--color-border-secondary)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(145deg, var(--color-terracotta-100) 0%, var(--color-terracotta-200) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-5)',
          color: 'var(--color-terracotta-500)',
        }}>
          <EditIcon size={28} />
        </div>
        <h4 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)',
        }}>
          Share Your Experience
        </h4>
        <p style={{
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-base)',
        }}>
          Sign in to leave a review for this market
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--color-border-secondary)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: 'var(--space-6) var(--space-8)',
        borderBottom: '1px solid var(--color-border-secondary)',
        background: 'linear-gradient(145deg, var(--color-cream-100) 0%, var(--color-cream-200) 100%)',
      }}>
        <h4 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-terracotta-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-terracotta-500)',
          }}>
            <EditIcon size={18} />
          </div>
          Write a Review
        </h4>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)',
          marginTop: 'var(--space-2)',
          marginLeft: 'calc(36px + var(--space-3))',
        }}>
          for {market.name}
        </p>
      </div>

      {/* Form Content */}
      <div style={{ padding: 'var(--space-8)' }}>
        {/* Rating Input */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-4)',
          }}>
            Your Rating
          </label>
          <StarRating rating={rating} onChange={setRating} size={36} />
        </div>

        {/* Review Text Input */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-4)',
          }}>
            Your Review
          </label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Share your experience at this market... What made it special? What would you recommend?"
            style={{
              width: '100%',
              minHeight: '140px',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: `2px solid ${isFocused ? 'var(--color-terracotta-400)' : 'var(--color-border-primary)'}`,
              fontSize: 'var(--text-base)',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 'var(--leading-relaxed)',
              backgroundColor: isFocused ? 'var(--color-bg-card)' : 'var(--color-cream-100)',
              color: 'var(--color-text-primary)',
              transition: 'all var(--transition-base)',
              boxShadow: isFocused ? '0 0 0 4px rgba(196, 101, 74, 0.1)' : 'none',
            }}
          />

          {/* Character Progress */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'var(--space-3)',
          }}>
            <div style={{
              flex: 1,
              height: '6px',
              backgroundColor: 'var(--color-cream-200)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginRight: 'var(--space-4)',
            }}>
              <div style={{
                height: '100%',
                width: `${charProgress * 100}%`,
                backgroundColor: charProgress >= 1 ? 'var(--color-sage-500)' : 'var(--color-terracotta-400)',
                borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition-base)',
              }} />
            </div>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: charProgress >= 1 ? 'var(--color-sage-600)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}>
              {charProgress >= 1 && <CheckIcon size={12} />}
              {review.length} / 10 min
            </span>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-5)',
            backgroundColor: result.success ? 'var(--color-sage-100)' : 'var(--color-terracotta-100)',
            color: result.success ? 'var(--color-sage-700)' : 'var(--color-terracotta-700)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            {result.success && <CheckIcon size={16} />}
            {result.message}
          </div>
        )}

        {/* Submit Button - Pill Style */}
        <button
          type="submit"
          disabled={submitting || !isValid}
          style={{
            width: '100%',
            padding: 'var(--space-4) var(--space-6)',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: isValid
              ? 'linear-gradient(145deg, var(--color-terracotta-400) 0%, var(--color-terracotta-500) 100%)'
              : 'var(--color-cream-300)',
            color: isValid ? 'white' : 'var(--color-text-muted)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-base)',
            boxShadow: isValid ? '0 4px 12px rgba(196, 101, 74, 0.25)' : 'none',
          }}
        >
          {submitting ? 'Posting...' : 'Submit Review'}
        </button>

        {/* Sentiment Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-5)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-sage-100)',
          borderRadius: 'var(--radius-xl)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-sage-700)',
        }}>
          <SparklesIcon size={14} />
          Your review will be analyzed for sentiment
        </div>
      </div>
    </form>
  );
}
