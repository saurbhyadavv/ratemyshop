import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Store, MapPin, Send, CheckCircle, Navigation, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import RatingDistribution from '../components/RatingDistribution';
import './ShopReviewPage.css';

function getShopName(upiId) {
  const decoded = decodeURIComponent(upiId);
  const name = decoded.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');
}

/* ── Empty State Illustration ────────────────────── */
function EmptyStateIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Shop silhouette */}
      <rect x="40" y="60" width="120" height="80" rx="8" fill="#FFF3E8" stroke="#FFE0CC" strokeWidth="2" />
      <rect x="40" y="52" width="120" height="12" rx="4" fill="#FF6B2B" opacity="0.15" />
      <path d="M36 52 L100 20 L164 52" stroke="#FF6B2B" strokeWidth="2.5" fill="none" opacity="0.3" />
      {/* Awning stripes */}
      <rect x="44" y="52" width="14" height="10" rx="2" fill="#FF6B2B" opacity="0.12" />
      <rect x="62" y="52" width="14" height="10" rx="2" fill="#F9A825" opacity="0.12" />
      <rect x="80" y="52" width="14" height="10" rx="2" fill="#C62828" opacity="0.12" />
      <rect x="98" y="52" width="14" height="10" rx="2" fill="#00897B" opacity="0.12" />
      <rect x="116" y="52" width="14" height="10" rx="2" fill="#1565C0" opacity="0.12" />
      <rect x="134" y="52" width="14" height="10" rx="2" fill="#FF6B2B" opacity="0.12" />
      {/* Door */}
      <rect x="82" y="95" width="36" height="45" rx="4" fill="#FFE0CC" stroke="#FF6B2B" strokeWidth="1.5" opacity="0.5" />
      <circle cx="112" cy="118" r="3" fill="#F9A825" opacity="0.6" />
      {/* Windows */}
      <rect x="50" y="72" width="24" height="18" rx="3" fill="#E8F5E9" stroke="#00897B" strokeWidth="1" opacity="0.4" />
      <rect x="126" y="72" width="24" height="18" rx="3" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" opacity="0.4" />
      {/* Stars floating */}
      <g opacity="0.35">
        <path d="M28 45 l2 4 4.5 0.7 -3.2 3.2 0.8 4.5 -4-2.1 -4 2.1 0.8-4.5 -3.2-3.2 4.5-0.7Z" fill="#F9A825" />
        <path d="M170 35 l1.5 3 3.4 0.5 -2.4 2.4 0.6 3.4 -3-1.6 -3 1.6 0.6-3.4 -2.4-2.4 3.4-0.5Z" fill="#FF6B2B" />
        <path d="M22 90 l1 2 2.3 0.3 -1.6 1.6 0.4 2.3 -2-1.1 -2 1.1 0.4-2.3 -1.6-1.6 2.3-0.3Z" fill="#00897B" />
        <path d="M178 80 l1 2 2.3 0.3 -1.6 1.6 0.4 2.3 -2-1.1 -2 1.1 0.4-2.3 -1.6-1.6 2.3-0.3Z" fill="#C62828" />
      </g>
      {/* Madhubani dots */}
      <circle cx="30" cy="70" r="2" fill="#F9A825" opacity="0.2" />
      <circle cx="172" cy="60" r="2" fill="#C62828" opacity="0.2" />
      <circle cx="15" cy="110" r="1.5" fill="#00897B" opacity="0.2" />
      <circle cx="185" cy="100" r="1.5" fill="#FF6B2B" opacity="0.2" />
      {/* Question marks */}
      <text x="66" y="88" fontSize="14" fill="#FF6B2B" opacity="0.3" fontFamily="Outfit, sans-serif" fontWeight="700">?</text>
      <text x="140" y="88" fontSize="14" fill="#00897B" opacity="0.3" fontFamily="Outfit, sans-serif" fontWeight="700">?</text>
    </svg>
  );
}

/* ── Page Variants ───────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

const cardEntrance = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 } },
};

/* ── Sort helpers ─────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

function sortReviews(reviews, sortBy) {
  const sorted = [...reviews];
  switch (sortBy) {
    case 'helpful':
      return sorted.sort((a, b) => b.helpful - a.helpful);
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating);
    case 'recent':
    default:
      return sorted;
  }
}

/* ── Star SVG path for inline star rendering ──────── */
const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z';

function InlineStars({ rating, size = 16 }) {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? '#F9A825' : '#E2E8F0'}
          stroke={star <= rating ? '#F57F17' : '#CBD5E1'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */
export default function ShopReviewPage() {
  const { upiId } = useParams();
  const navigate = useNavigate();
  const decodedUpiId = decodeURIComponent(upiId);
  const shopName = getShopName(upiId);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const hasReviews = reviews.length > 0;
  
  const [sortBy, setSortBy] = useState('recent');
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [locating, setLocating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Fetch reviews from Supabase */
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('shop_id', decodedUpiId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const fetchedReviews = (data || []).map(row => {
          let dateStr = 'Just now';
          if (row.created_at) {
            dateStr = new Date(row.created_at).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'short', day: 'numeric'
            });
          }
          return {
            id: row.id,
            author: row.author,
            rating: row.rating,
            text: row.text,
            helpful: row.helpful,
            date: dateStr
          };
        });
        if (isMounted) setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, [decodedUpiId]);

  /* One-click geolocation */
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationText('Location not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [
            addr.suburb || addr.neighbourhood || addr.village || '',
            addr.city || addr.town || addr.state_district || '',
          ].filter(Boolean);
          setLocationText(parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          const { latitude, longitude } = pos.coords;
          setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => {
        setLocationText('');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const sortedReviews = useMemo(() => sortReviews(reviews, sortBy), [reviews, sortBy]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  /* Rating distribution counts */
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const s = Math.round(r.rating);
      if (s >= 1 && s <= 5) counts[s]++;
    });
    return counts;
  }, [reviews]);

  const maxCount = useMemo(() => Math.max(...Object.values(ratingCounts), 1), [ratingCounts]);

  const handleSubmitReview = async () => {
    if (newRating === 0 || newReviewText.trim().length < 3) return;
    setSubmitting(true);

    try {
      // 1. Ensure shop exists (upsert)
      const { error: shopError } = await supabase
        .from('shops')
        .upsert(
          { upi_id: decodedUpiId, name: shopName, category: 'General Store' },
          { onConflict: 'upi_id' }
        );
        
      if (shopError) throw shopError;

      // 2. Add review
      const reviewPayload = {
        shop_id: decodedUpiId,
        author: 'Anonymous',
        rating: newRating,
        text: newReviewText.trim() + (locationText ? ` 📍 ${locationText}` : ''),
        helpful: 0
      };

      const { data: insertedData, error: reviewError } = await supabase
        .from('reviews')
        .insert(reviewPayload)
        .select()
        .single();

      if (reviewError) throw reviewError;

      // 3. Update local state immediately for snappy UI
      const addedReview = {
        id: insertedData.id,
        author: insertedData.author,
        rating: insertedData.rating,
        text: insertedData.text,
        helpful: insertedData.helpful,
        date: 'Just now'
      };

      setReviews([addedReview, ...reviews]);
      setNewRating(0);
      setNewReviewText('');
      setLocationText('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Error adding review:", err);
      alert("Failed to submit review. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = newRating > 0 && newReviewText.trim().length >= 3;

  return (
    <motion.div
      className="shop-review-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── Back Navigation ─────────────────────────── */}
      <nav className="back-nav">
        <Link to="/" className="back-link">
          <ArrowLeft />
          Back to Home
        </Link>
      </nav>

      {/* ── Shop Header Card ────────────────────────── */}
      <div className="shop-header">
        <motion.div className="shop-header-card" {...cardEntrance}>
          {/* Shop image banner */}
          <div className="shop-image-banner">
            <img src="/shop-placeholder.png" alt={`${shopName}'s Shop`} />
          </div>

          <div className="shop-header-content">
            <div className="shop-avatar">
              {shopName.charAt(0).toUpperCase()}
            </div>

            <div className="shop-info">
              <h1 className="shop-name">{shopName}'s Shop</h1>
              <p className="shop-category">
                <Store size={14} />
                General Store
              </p>
              <span className="shop-upi-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                {decodedUpiId}
              </span>
            </div>

            <div className="shop-rating-summary">
              <motion.div
                className="rating-big-number"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
              >
                {averageRating}
              </motion.div>
              <div className="rating-stars-row">
                <InlineStars rating={Math.round(parseFloat(averageRating))} size={20} />
              </div>
              <span className="rating-count">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Content Grid: Sidebar + Reviews ─────────── */}
      <div className={`shop-content ${!hasReviews ? 'shop-content--empty' : ''}`}>
        {/* Rating Distribution Sidebar — only show when there are reviews */}
        {hasReviews && (
          <motion.aside
            className="rating-distribution-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <h3 className="rating-dist-title">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = ratingCounts[star];
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div className="rating-bar-row" key={star}>
                  <span className="rating-bar-label">
                    {star}
                    <svg viewBox="0 0 24 24" fill="#F9A825" stroke="#F57F17" strokeWidth="1.5">
                      <path d={STAR_PATH} />
                    </svg>
                  </span>
                  <div className="rating-bar-track">
                    <motion.div
                      className="rating-bar-fill"
                      data-rating={star}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="rating-bar-count">{pct}%</span>
                </div>
              );
            })}
          </motion.aside>
        )}

        {/* Reviews + Add Review */}
        <div className="reviews-section">
          {/* Header with sort — only show sort when reviews exist */}
          <div className="reviews-header">
            <h2 className="reviews-title">Customer Reviews</h2>
            {hasReviews && (
              <select
                className="reviews-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Review Cards or Empty State */}
          {loadingReviews ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              <Loader size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: '#00897B' }} />
              <p>Loading reviews...</p>
            </div>
          ) : sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="empty-state__illustration">
                <EmptyStateIllustration />
              </div>

              <h3 className="empty-state__title">No Reviews Yet</h3>
              <p className="empty-state__subtitle">
                This shop hasn't been reviewed by anyone yet.<br />
                Be the pioneer — your review helps build trust for local businesses!
              </p>

              <div className="empty-state__features">
                <div className="empty-state__feature">
                  <span className="empty-state__feature-icon">⭐</span>
                  <span>Rate your experience</span>
                </div>
                <div className="empty-state__feature">
                  <span className="empty-state__feature-icon">✍️</span>
                  <span>Share what you liked</span>
                </div>
                <div className="empty-state__feature">
                  <span className="empty-state__feature-icon">🤝</span>
                  <span>Help the community</span>
                </div>
              </div>

              <motion.button
                className="empty-state__cta"
                onClick={() => {
                  const el = document.getElementById('add-review-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(255,107,43,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Send size={18} />
                Write the First Review
              </motion.button>
            </motion.div>
          )}

          {/* ── Add Review Form ─────────────────────── */}
          <motion.div
            id="add-review-section"
            className="add-review-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="add-review-title">Write a Review</h3>
            <p className="add-review-subtitle">
              Share your experience to help others make better decisions
            </p>

            {/* Star Rating */}
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <StarRating rating={newRating} onRate={setNewRating} size={32} />
            </div>

            {/* Review Text */}
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea
                className="review-textarea"
                placeholder="Tell others about your experience at this shop..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                rows={4}
              />
            </div>

            {/* Location — easy one-click + manual */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Location <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
              </label>
              <div className="location-row">
                <button
                  type="button"
                  className="location-detect-btn"
                  onClick={handleDetectLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <><Loader size={15} className="spin" /> Detecting...</>
                  ) : (
                    <><Navigation size={15} /> Use My Location</>
                  )}
                </button>
                <input
                  className="location-input"
                  type="text"
                  placeholder="or type: Sector 22, Chandigarh"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              className="submit-btn"
              onClick={handleSubmitReview}
              disabled={!canSubmit || submitting}
              whileHover={canSubmit && !submitting ? { scale: 1.03 } : {}}
              whileTap={canSubmit && !submitting ? { scale: 0.97 } : {}}
            >
              {submitting ? <Loader size={18} className="spin" /> : <Send size={18} />}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Success Toast ─────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="success-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="success-toast-icon">
              <CheckCircle />
            </div>
            <div className="success-toast-text">
              <strong>Review submitted!</strong>
              <span>Thank you for helping the community 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
