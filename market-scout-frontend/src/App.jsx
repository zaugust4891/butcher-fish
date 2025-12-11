import { useState, useMemo } from 'react';
import { useAuth, useMarkets, useLeaderboard } from './hooks/useApi';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AddMarketModal from './components/AddMarketModal';
import MarketCard from './components/MarketCard';
import ReviewForm from './components/ReviewForm';
import ProfilePanel from './components/ProfilePanel';
import { TrophyIcon, SparklesIcon, LeafIcon, StoreIcon } from './components/Icons';

/**
 * Main Application Component
 *
 * Modern bento-grid layout with warm earth tones.
 */
export default function App() {
  const { user, login, logout, register, isAuthenticated } = useAuth();
  const { markets, apiConnected, refetch: refetchMarkets } = useMarkets();
  const { leaderboard, refetch: refetchLeaderboard } = useLeaderboard();

  const [showAuth, setShowAuth] = useState(false);
  const [showAddMarket, setShowAddMarket] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedMarket, setSelectedMarket] = useState(null);

  const marketsWithScores = useMemo(() => {
    return markets.map(market => {
      const lb = leaderboard.find(l => l.id === market.id);
      return { ...market, score: lb?.score };
    });
  }, [markets, leaderboard]);

  const rankedMarkets = useMemo(() => {
    return [...marketsWithScores]
      .filter(m => m.score !== undefined)
      .sort((a, b) => b.score - a.score);
  }, [marketsWithScores]);

  const handleReviewSubmitted = () => {
    refetchLeaderboard();
  };

  const handleMarketAdded = () => {
    refetchMarkets();
    refetchLeaderboard();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
    }}>
      <Header
        user={user}
        apiConnected={apiConnected}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLoginClick={() => setShowAuth(true)}
        onLogout={logout}
      />

      {/* Main Content Area - Generous Padding */}
      <main style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'var(--space-12) var(--space-8)',
      }}>
        {/* DISCOVER TAB - Bento Grid Layout */}
        {activeTab === 'discover' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedMarket ? '1fr 400px' : '1fr',
            gap: 'var(--space-10)',
            alignItems: 'start',
          }}>
            <div>
              {/* Section Header - Modern Style */}
              <div style={{ marginBottom: 'var(--space-10)' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-4) var(--space-2) var(--space-2)',
                  backgroundColor: 'var(--color-sage-100)',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: 'var(--space-5)',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-sage-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}>
                    <LeafIcon size={16} />
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-sage-700)',
                  }}>
                    Explore Local Markets
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-5xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-tight)',
                  marginBottom: 'var(--space-4)',
                }}>
                  Discover artisan<br />food markets
                </h2>
                <p style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-lg)',
                  maxWidth: '480px',
                  marginBottom: user ? 'var(--space-6)' : 0,
                }}>
                  Find specialty food shops, farmers markets, and gourmet stores in your neighborhood.
                </p>

                {/* Add Market Button - Only visible when logged in */}
                {user && (
                  <button
                    onClick={() => setShowAddMarket(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-5)',
                      backgroundColor: 'var(--color-sage-500)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      boxShadow: '0 2px 8px rgba(125, 145, 105, 0.25)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--color-sage-600)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(125, 145, 105, 0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--color-sage-500)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(125, 145, 105, 0.25)';
                    }}
                  >
                    <StoreIcon size={16} />
                    Add New Market
                  </button>
                )}
              </div>

              {/* Market Bento Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 'var(--space-6)',
              }}>
                {marketsWithScores.map(market => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onSelect={setSelectedMarket}
                    isSelected={selectedMarket?.id === market.id}
                  />
                ))}
              </div>
            </div>

            {/* Review Form Sidebar - Sticky */}
            {selectedMarket && (
              <div style={{
                position: 'sticky',
                top: 'calc(var(--header-height) + var(--space-8))',
                alignSelf: 'start',
              }}>
                <ReviewForm
                  market={selectedMarket}
                  user={user}
                  onSubmitSuccess={handleReviewSubmitted}
                />
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Section Header - Centered */}
            <div style={{
              textAlign: 'center',
              maxWidth: '640px',
              margin: '0 auto var(--space-12)',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-2xl)',
                background: 'linear-gradient(145deg, var(--color-ochre-400) 0%, var(--color-ochre-500) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                margin: '0 auto var(--space-6)',
                boxShadow: '0 8px 24px rgba(212, 168, 83, 0.3)',
              }}>
                <TrophyIcon size={40} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-5xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
                lineHeight: 'var(--leading-tight)',
              }}>
                Top Rated Markets
              </h2>
              <p style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-lg)',
                marginBottom: 'var(--space-6)',
              }}>
                Community favorites ranked by ratings and reviews
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: 'var(--color-cream-200)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border-secondary)',
              }}>
                Score = (rating × 0.6) + (sentiment × 0.3) + (log₁₀(reviews) × 0.1)
              </div>
            </div>

            {/* Leaderboard List */}
            <div style={{
              maxWidth: '720px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}>
              {rankedMarkets.length > 0 ? (
                rankedMarkets.map((market, idx) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    rank={idx + 1}
                    onSelect={m => {
                      setSelectedMarket(m);
                      setActiveTab('discover');
                    }}
                    isSelected={false}
                  />
                ))
              ) : (
                <div style={{
                  padding: 'var(--space-16)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-2xl)',
                  border: '1px solid var(--color-border-secondary)',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'var(--color-cream-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-5)',
                    color: 'var(--color-text-muted)',
                  }}>
                    <TrophyIcon size={28} />
                  </div>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-lg)',
                  }}>
                    No rankings yet. Reviews are needed to generate scores!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && user && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <ProfilePanel user={user} />
          </div>
        )}
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          onLogin={login}
          onRegister={register}
          onClose={() => setShowAuth(false)}
        />
      )}

      {showAddMarket && (
        <AddMarketModal
          onClose={() => setShowAddMarket(false)}
          onSuccess={handleMarketAdded}
        />
      )}
    </div>
  );
}
