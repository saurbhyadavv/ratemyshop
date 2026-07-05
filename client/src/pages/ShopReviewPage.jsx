import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Store, MapPin, Send, CheckCircle, Navigation,
  Loader, QrCode, Pencil, LogIn,
  Check, X, AlertCircle,
  ThumbsUp, Sparkles, Clock, Coins, Smile, Timer, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { resolveHash } from '../lib/upiHash';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import RatingDistribution from '../components/RatingDistribution';
import OwnerQrModal from '../components/OwnerQrModal';
import AuthModal from '../components/AuthModal';
import './ShopReviewPage.css';

/* ── Shop type definitions ────────────────────────── */
export const SHOP_TYPES = [
  { value: 'kirana', label: 'Kirana / General Store' },
  { value: 'food_stall', label: 'Food Stall / Dhaba' },
  { value: 'restaurant', label: 'Restaurant / Cafe' },
  { value: 'pharmacy', label: 'Pharmacy / Medical' },
  { value: 'salon_barbershop', label: 'Salon / Barbershop' },
  { value: 'electronics', label: 'Electronics Shop' },
  { value: 'mobile_repair', label: 'Mobile Repair' },
  { value: 'clothing', label: 'Clothing / Garments' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
  { value: 'dairy_eggs', label: 'Dairy & Eggs' },
  { value: 'bakery', label: 'Bakery / Sweets' },
  { value: 'hardware', label: 'Hardware / Tools' },
  { value: 'stationery', label: 'Stationery / Books' },
  { value: 'auto_parts', label: 'Auto Parts / Garage' },
  { value: 'general', label: 'Other' },
];

function getShopName(upiId) {
  const decoded = decodeURIComponent(upiId);
  const name = decoded.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');
}

/* ── Inline star renderer ─────────────────────────── */
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z';

function InlineStars({ rating, size = 16 }) {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24"
          fill={star <= rating ? '#F9A825' : '#E2E8F0'}
          stroke={star <= rating ? '#F57F17' : '#CBD5E1'}
          strokeWidth="1.5" strokeLinejoin="round">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/* ── Empty state SVG ──────────────────────────────── */
function EmptyStateIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="40" y="60" width="120" height="80" rx="8" fill="#FFF3E8" stroke="#FFE0CC" strokeWidth="2" />
      <rect x="40" y="52" width="120" height="12" rx="4" fill="#FF6B2B" opacity="0.15" />
      <path d="M36 52 L100 20 L164 52" stroke="#FF6B2B" strokeWidth="2.5" fill="none" opacity="0.3" />
      <rect x="44" y="52" width="14" height="10" rx="2" fill="#FF6B2B" opacity="0.12" />
      <rect x="62" y="52" width="14" height="10" rx="2" fill="#F9A825" opacity="0.12" />
      <rect x="80" y="52" width="14" height="10" rx="2" fill="#C62828" opacity="0.12" />
      <rect x="98" y="52" width="14" height="10" rx="2" fill="#00897B" opacity="0.12" />
      <rect x="116" y="52" width="14" height="10" rx="2" fill="#1565C0" opacity="0.12" />
      <rect x="82" y="95" width="36" height="45" rx="4" fill="#FFE0CC" stroke="#FF6B2B" strokeWidth="1.5" opacity="0.5" />
      <circle cx="112" cy="118" r="3" fill="#F9A825" opacity="0.6" />
      <rect x="50" y="72" width="24" height="18" rx="3" fill="#E8F5E9" stroke="#00897B" strokeWidth="1" opacity="0.4" />
      <rect x="126" y="72" width="24" height="18" rx="3" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ── Pill toggle ──────────────────────────────────── */
function TriToggle({ value, onChange, options }) {
  return (
    <div className="tri-toggle">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`tri-toggle__btn ${value === opt.value ? 'tri-toggle__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Price range picker ──────────────────────────── */
const PRICE_LABELS = ['Budget', 'Moderate', 'Pricey', 'Premium'];
function PriceRangePicker({ value, onChange }) {
  return (
    <div className="price-range-picker">
      {[1, 2, 3, 4].map((n) => (
        <button
          key={n}
          type="button"
          className={`price-btn ${value === n ? 'price-btn--active' : ''}`}
          onClick={() => onChange(n)}
          title={PRICE_LABELS[n - 1]}
        >
          {'₹'.repeat(n)}
        </button>
      ))}
      {value > 0 && <span className="price-label">{PRICE_LABELS[value - 1]}</span>}
    </div>
  );
}

/* ── 1–5 sub-rating ──────────────────────────────── */
function SubRating({ value, onChange, label }) {
  return (
    <div className="sub-rating">
      <span className="sub-rating__label">{label}</span>
      <div className="sub-rating__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`sub-star ${value >= n ? 'sub-star--on' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n} star`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={value >= n ? '#F9A825' : '#E2E8F0'}
              stroke={value >= n ? '#F57F17' : '#CBD5E1'}
              strokeWidth="1.5">
              <path d={STAR_PATH} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Page variants ────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};
const cardEntrance = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 } },
};

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

function sortReviews(reviews, sortBy) {
  const sorted = [...reviews];
  switch (sortBy) {
    case 'helpful': return sorted.sort((a, b) => b.helpful - a.helpful);
    case 'highest': return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest': return sorted.sort((a, b) => a.rating - b.rating);
    default: return sorted;
  }
}

/* ── Main Component ──────────────────────────────── */
export default function ShopReviewPage() {
  const { shopHash } = useParams();
  const navigate = useNavigate();
  const { user, displayName } = useAuth();

  const [decodedUpiId, setDecodedUpiId] = useState(null);
  const [resolvingError, setResolvingError] = useState(false);

  /* ── State ─────────────────────────────────────── */
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [votedReviewIds, setVotedReviewIds] = useState(new Set());

  /* Shop info from community suggestions */
  const [shopDisplayName, setShopDisplayName] = useState('');
  const [shopType, setShopType] = useState('general');
  const [isEditingShopInfo, setIsEditingShopInfo] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestType, setSuggestType] = useState('');
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [suggestDone, setSuggestDone] = useState(false);

  /* Review form */
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(true);
  const [locationText, setLocationText] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState(null);

  /* Structured data fields */
  const [isOpen, setIsOpen] = useState(null);        // boolean
  const [priceRange, setPriceRange] = useState(0);   // 1-4
  const [isHygienic, setIsHygienic] = useState(null);
  const [staffBehaviour, setStaffBehaviour] = useState(0);  // 1-5
  const [waitTime, setWaitTime] = useState('');       // 'short'|'medium'|'long'
  const [acceptsUpi, setAcceptsUpi] = useState(true);
  const [acceptsCash, setAcceptsCash] = useState(null);
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [visitType, setVisitType] = useState('');    // 'first'|'occasional'|'regular'
  // Food/restaurant
  const [foodQuality, setFoodQuality] = useState(0);
  const [foodTaste, setFoodTaste] = useState(0);
  const [foodSpice, setFoodSpice] = useState('');
  // Kirana
  const [inventoryLevel, setInventoryLevel] = useState('');
  const [freshness, setFreshness] = useState(0);
  const [discountAvailable, setDiscountAvailable] = useState(null);
  // Pharmacy
  const [medicineAvailability, setMedicineAvailability] = useState('');
  // Salon
  const [skillLevel, setSkillLevel] = useState(0);
  const [appointmentNeeded, setAppointmentNeeded] = useState(null);
  // Electronics/Repair
  const [repairQuality, setRepairQuality] = useState(0);
  const [warrantyGiven, setWarrantyGiven] = useState(null);

  const hasReviews = reviews.length > 0;

  const isFood = ['food_stall', 'restaurant', 'bakery'].includes(shopType);
  const isKirana = ['kirana', 'fruits_vegetables', 'dairy_eggs'].includes(shopType);
  const isPharmacy = shopType === 'pharmacy';
  const isSalon = shopType === 'salon_barbershop';
  const isElectronics = ['electronics', 'mobile_repair'].includes(shopType);

  /* ── Resolve Hash ──────────────────────────────── */
  useEffect(() => {
    async function resolve() {
      if (!shopHash) return;
      if (shopHash.includes('@')) {
        const raw = decodeURIComponent(shopHash).toLowerCase();
        setDecodedUpiId(raw);
        setShopDisplayName(getShopName(raw));
        return;
      }
      const resolved = await resolveHash(shopHash);
      if (resolved) {
        setDecodedUpiId(resolved);
        setShopDisplayName(getShopName(resolved));
      } else {
        setResolvingError(true);
      }
    }
    resolve();
  }, [shopHash]);

  /* ── Fetch reviews + shop info ─────────────────── */
  useEffect(() => {
    if (!decodedUpiId) return;
    let isMounted = true;

    const fetchAll = async () => {
      setLoadingReviews(true);
      try {
        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('shop_id', decodedUpiId)
          .order('created_at', { ascending: false });

        if (isMounted) {
          setReviews((reviewData || []).map((row) => ({
            ...row,
            id: row.id,
            author: row.author || 'Anonymous',
            rating: row.rating,
            text: row.text,
            helpful: row.helpful || 0,
            date: row.created_at || 'Just now',
          })));

          if (user) {
            const userReview = reviewData?.find((r) => r.user_id === user.id);
            if (userReview) {
              setExistingUserReview(userReview);
              setNewRating(userReview.rating || 0);
              setNewReviewText(userReview.text || '');
              setPostAnonymously(userReview.anonymous ?? true);
              setLocationText(userReview.location || '');
              setIsOpen(userReview.is_open);
              setPriceRange(userReview.price_range || 0);
              setIsHygienic(userReview.is_hygienic);
              setStaffBehaviour(userReview.staff_behaviour || 0);
              setWaitTime(userReview.wait_time || '');
              setAcceptsUpi(userReview.accepts_upi ?? true);
              setAcceptsCash(userReview.accepts_cash);
              setWouldRecommend(userReview.would_recommend);
              setVisitType(userReview.visit_type || '');
              setFoodQuality(userReview.food_quality || 0);
              setFoodTaste(userReview.food_taste || 0);
              setFoodSpice(userReview.food_spice || '');
              setInventoryLevel(userReview.inventory_level || '');
              setFreshness(userReview.freshness || 0);
              setDiscountAvailable(userReview.discount_available);
              setMedicineAvailability(userReview.medicine_availability || '');
              setSkillLevel(userReview.skill_level || 0);
              setAppointmentNeeded(userReview.appointment_needed);
              setRepairQuality(userReview.repair_quality || 0);
              setWarrantyGiven(userReview.warranty_given);
            } else {
              setExistingUserReview(null);
            }
          } else {
            setExistingUserReview(null);
          }
        }

        // Fetch shop details from the shops table
        const { data: shopData } = await supabase
          .from('shops')
          .select('display_name, shop_type, name, category')
          .eq('upi_id', decodedUpiId)
          .maybeSingle();

        if (isMounted && shopData) {
          const dbName = shopData.display_name || shopData.name;
          const dbType = shopData.shop_type || shopData.category;
          if (dbName) setShopDisplayName(dbName);
          if (dbType) setShopType(dbType);
        }

        // Fetch all community shop info suggestions
        const { data: allSugg } = await supabase
          .from('shop_suggestions')
          .select('suggested_name, suggested_type, votes, created_at')
          .eq('shop_id', decodedUpiId);

        if (isMounted && allSugg && allSugg.length > 0) {
          // Find highest voted name suggestion
          const nameSugg = allSugg
            .filter((s) => s.suggested_name)
            .sort((a, b) => b.votes - a.votes)[0];
          if (nameSugg) setShopDisplayName(nameSugg.suggested_name);

          // Find latest type suggestion
          const typeSugg = allSugg
            .filter((s) => s.suggested_type)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          if (typeSugg) setShopType(typeSugg.suggested_type);
        }

        // Fetch user voted reviews
        const localVotes = JSON.parse(localStorage.getItem('ratemyshop_voted_reviews') || '[]');
        let dbVotesList = [];
        if (user) {
          const { data: dbVotes } = await supabase
            .from('review_votes')
            .select('review_id')
            .eq('user_id', user.id);
          if (dbVotes) {
            dbVotesList = dbVotes.map((v) => v.review_id);
          }
        }
        if (isMounted) {
          setVotedReviewIds(new Set([...localVotes, ...dbVotesList]));
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [decodedUpiId, user]);

  /* ── Geolocation ────────────────────────────────── */
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationText('Not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const parts = [addr.suburb || addr.neighbourhood || addr.village || '', addr.city || addr.town || addr.state_district || ''].filter(Boolean);
          setLocationText(parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          const { latitude, longitude } = pos.coords;
          setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => { setLocationText(''); setLocating(false); },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  /* ── Submit suggestion ──────────────────────────── */
  const handleSuggestSubmit = async (e) => {
    e?.preventDefault();
    if (!suggestName.trim() && !suggestType) return;
    setSuggestSubmitting(true);
    try {
      await supabase.from('shop_suggestions').insert({
        shop_id: decodedUpiId,
        suggested_name: suggestName.trim() || null,
        suggested_type: suggestType || null,
        votes: 1,
      });
      if (suggestName.trim()) setShopDisplayName(suggestName.trim());
      if (suggestType) setShopType(suggestType);
      setIsEditingShopInfo(false);
      setSuggestDone(true);
    } catch (err) {
      console.error('Suggestion error:', err);
    } finally {
      setSuggestSubmitting(false);
    }
  };

  /* ── Submit review ──────────────────────────────── */
  const handleSubmitReview = async () => {
    if (newRating === 0 || newReviewText.trim().length < 3) return;
    setSubmitting(true);

    try {
      // Upsert shop
      await supabase.from('shops').upsert(
        { 
          upi_id: decodedUpiId, 
          display_name: shopDisplayName,
          name: shopDisplayName, 
          shop_type: shopType,
          category: shopType 
        },
        { onConflict: 'upi_id' }
      );

      const authorName = user
        ? (postAnonymously ? 'Anonymous' : displayName)
        : 'Anonymous';

      const payload = {
        shop_id: decodedUpiId,
        author: authorName,
        rating: newRating,
        text: newReviewText.trim(),
        helpful: 0,
        location: locationText || null,
        anonymous: !user || postAnonymously,
        user_id: user?.id || null,
        shop_type: shopType,
        is_open: isOpen,
        price_range: priceRange || null,
        is_hygienic: isHygienic,
        staff_behaviour: staffBehaviour || null,
        wait_time: waitTime || null,
        accepts_upi: acceptsUpi,
        accepts_cash: acceptsCash,
        would_recommend: wouldRecommend,
        visit_type: visitType || null,
        // Food
        food_quality: isFood ? (foodQuality || null) : null,
        food_taste: isFood ? (foodTaste || null) : null,
        food_spice: isFood ? (foodSpice || null) : null,
        // Kirana
        inventory_level: isKirana ? (inventoryLevel || null) : null,
        freshness: isKirana ? (freshness || null) : null,
        discount_available: isKirana ? discountAvailable : null,
        // Pharmacy
        medicine_availability: isPharmacy ? (medicineAvailability || null) : null,
        // Salon
        skill_level: isSalon ? (skillLevel || null) : null,
        appointment_needed: isSalon ? appointmentNeeded : null,
        // Electronics
        repair_quality: isElectronics ? (repairQuality || null) : null,
        warranty_given: isElectronics ? warrantyGiven : null,
      };

      if (existingUserReview) {
        // Update existing review
        const { data: updated, error } = await supabase
          .from('reviews')
          .update({
            ...payload,
            helpful: existingUserReview.helpful // keep current helpful count
          })
          .eq('id', existingUserReview.id)
          .select()
          .single();
        if (error) throw error;

        setReviews((prev) =>
          prev.map((r) =>
            r.id === updated.id
              ? {
                  ...updated,
                  id: updated.id,
                  author: updated.author,
                  rating: updated.rating,
                  text: updated.text,
                  helpful: r.helpful,
                  date: 'Just updated',
                }
              : r
          )
        );
        setExistingUserReview(updated);
      } else {
        // Insert new review
        const { data: inserted, error } = await supabase
          .from('reviews')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        setReviews([
          {
            ...inserted,
            id: inserted.id,
            author: inserted.author,
            rating: inserted.rating,
            text: inserted.text,
            helpful: 0,
            date: 'Just now',
          },
          ...reviews,
        ]);
        setExistingUserReview(inserted);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Helpful vote ────────────────────────────────── */
  const handleHelpful = useCallback(async (reviewId) => {
    if (votedReviewIds.has(reviewId)) return;

    setVotedReviewIds((prev) => {
      const next = new Set(prev);
      next.add(reviewId);
      return next;
    });

    try {
      const localVoted = JSON.parse(localStorage.getItem('ratemyshop_voted_reviews') || '[]');
      if (!localVoted.includes(reviewId)) {
        localVoted.push(reviewId);
        localStorage.setItem('ratemyshop_voted_reviews', JSON.stringify(localVoted));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (user) {
      try {
        await supabase.from('review_votes').insert({ user_id: user.id, review_id: reviewId });
      } catch (err) {
        console.warn('DB vote insertion error:', err);
      }
    }

    try {
      const { data: current } = await supabase.from('reviews').select('helpful').eq('id', reviewId).single();
      const newHelpfulCount = (current?.helpful || 0) + 1;
      await supabase.from('reviews').update({ helpful: newHelpfulCount }).eq('id', reviewId);

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpful: newHelpfulCount } : r))
      );
    } catch (err) {
      console.error('Helpful error:', err);
    }
  }, [user, votedReviewIds]);

  const sortedReviews = useMemo(() => sortReviews(reviews, sortBy), [reviews, sortBy]);
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);
  const ratingCounts = useMemo(() => {
    const c = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { const s = Math.round(r.rating); if (s >= 1 && s <= 5) c[s]++; });
    return c;
  }, [reviews]);
  const maxCount = useMemo(() => Math.max(...Object.values(ratingCounts), 1), [ratingCounts]);
  const canSubmit = newRating > 0 && newReviewText.trim().length >= 3;

  const shopTypeLabel = SHOP_TYPES.find((t) => t.value === shopType)?.label || 'Shop';

  /* ── Shop summary metrics ────────────────────────── */
  const shopSummaryMetrics = useMemo(() => {
    if (!reviews.length) return null;

    let openVotes = 0;
    let closedVotes = 0;
    let hygienicVotes = 0;
    let unhygienicVotes = 0;
    let recommendVotes = 0;
    let disrecommendVotes = 0;
    let priceSum = 0;
    let priceCount = 0;
    let staffSum = 0;
    let staffCount = 0;
    const waitCounts = { short: 0, medium: 0, long: 0 };
    let waitTotal = 0;

    reviews.forEach((r) => {
      if (r.is_open === true) openVotes++;
      if (r.is_open === false) closedVotes++;
      
      if (r.is_hygienic === true) hygienicVotes++;
      if (r.is_hygienic === false) unhygienicVotes++;

      if (r.would_recommend === true) recommendVotes++;
      if (r.would_recommend === false) disrecommendVotes++;

      if (r.price_range) {
        priceSum += r.price_range;
        priceCount++;
      }

      if (r.staff_behaviour) {
        staffSum += r.staff_behaviour;
        staffCount++;
      }

      if (r.wait_time) {
        waitCounts[r.wait_time]++;
        waitTotal++;
      }
    });

    const openPercent = (openVotes + closedVotes) > 0 ? Math.round((openVotes / (openVotes + closedVotes)) * 100) : null;
    const hygienePercent = (hygienicVotes + unhygienicVotes) > 0 ? Math.round((hygienicVotes / (hygienicVotes + unhygienicVotes)) * 100) : null;
    const recommendPercent = (recommendVotes + disrecommendVotes) > 0 ? Math.round((recommendVotes / (recommendVotes + disrecommendVotes)) * 100) : null;
    
    const avgPrice = priceCount > 0 ? Math.round(priceSum / priceCount) : null;
    const avgStaff = staffCount > 0 ? (staffSum / staffCount).toFixed(1) : null;

    let commonWait = null;
    if (waitTotal > 0) {
      if (waitCounts.short >= waitCounts.medium && waitCounts.short >= waitCounts.long) commonWait = 'short';
      else if (waitCounts.medium >= waitCounts.short && waitCounts.medium >= waitCounts.long) commonWait = 'medium';
      else commonWait = 'long';
    }

    return {
      openPercent,
      hygienePercent,
      recommendPercent,
      avgPrice,
      avgStaff,
      commonWait,
    };
  }, [reviews]);

  /* ── 24h Hourly Open Rates calculation ───────────── */
  const { hourlyOpenRates, totalOpenReports } = useMemo(() => {
    const rates = Array(24).fill(0);
    const totals = Array(24).fill(0);
    let count = 0;

    reviews.forEach((r) => {
      if (r.is_open === null || r.is_open === undefined) return;
      const dateStr = r.created_at || r.date;
      if (!dateStr || dateStr === 'Just now') return;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      const hour = date.getHours();

      if (r.is_open === true) {
        rates[hour]++;
      }
      totals[hour]++;
      count++;
    });

    const ratesPercent = rates.map((val, idx) => (totals[idx] > 0 ? Math.round((val / totals[idx]) * 100) : 0));
    return { hourlyOpenRates: ratesPercent, totalOpenReports: count };
  }, [reviews]);

  const render24hChart = () => {
    const currentHour = new Date().getHours();
    const currentPct = hourlyOpenRates[currentHour];
    let statusText = 'No recent reports for this hour';
    if (hourlyOpenRates.some(r => r > 0)) {
      statusText = currentPct > 50 
        ? 'Probably open right now' 
        : currentPct > 0 
          ? 'Might be open right now' 
          : 'Likely closed right now';
    }

    return (
      <div className="open-chart-wrapper">
        <div className="open-chart-bars">
          {hourlyOpenRates.map((pct, hour) => {
            const isCurrent = hour === currentHour;
            const heightVal = pct > 0 ? `${pct}%` : '4px';
            
            let barColor = '#E2E8F0';
            if (pct > 0) {
              if (isCurrent) barColor = 'var(--deep-red)';
              else if (pct >= 80) barColor = 'var(--teal)';
              else if (pct >= 50) barColor = 'var(--gold)';
              else barColor = 'var(--saffron)';
            }

            return (
              <div 
                key={hour} 
                className={`open-chart-bar-col ${isCurrent ? 'is-current' : ''}`}
                style={{ height: '74px' }}
                title={`${hour}:00 - ${pct}% open probability`}
              >
                <div 
                  className="open-chart-bar-fill" 
                  style={{ 
                    height: heightVal, 
                    backgroundColor: barColor,
                    borderRadius: '2px 2px 0 0'
                  }} 
                />
              </div>
            );
          })}
        </div>
        <div className="open-chart-labels">
          <span>12A</span>
          <span>6A</span>
          <span>12P</span>
          <span>6P</span>
          <span>11P</span>
        </div>
        <span className="open-chart-status">{statusText}</span>
      </div>
    );
  };

  const renderSummaryCard = () => {
    if (!shopSummaryMetrics) return null;
    const { hygienePercent, recommendPercent, avgPrice, avgStaff, commonWait } = shopSummaryMetrics;

    const priceLabel = avgPrice === 1 ? 'Budget (₹)' : avgPrice === 2 ? 'Moderate (₹₹)' : avgPrice === 3 ? 'Pricey (₹₹₹)' : 'Premium (₹₹₹x)';
    const waitLabel = commonWait === 'short' ? 'Quick Service' : commonWait === 'medium' ? 'Average Wait' : 'Slow Service';

    const hasAnyMetric = hygienePercent !== null || recommendPercent !== null || avgPrice !== null || avgStaff !== null || commonWait !== null;

    if (!hasAnyMetric) return null;

    return (
      <div className="shop-summary-card">
        <h3 className="shop-summary-title">Community Summary</h3>
        <div className="shop-summary-list">
          {recommendPercent !== null && (
            <div className="summary-item">
              <div className="summary-icon-wrap">
                <ThumbsUp size={14} />
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-lbl">Recommendation Rate</span>
                  <span className="summary-val">{recommendPercent}%</span>
                </div>
                <div className="summary-progress-bar">
                  <div className="summary-progress-fill" style={{ width: `${recommendPercent}%`, backgroundColor: 'var(--teal)' }} />
                </div>
              </div>
            </div>
          )}

          {hygienePercent !== null && (
            <div className="summary-item">
              <div className="summary-icon-wrap">
                <Sparkles size={14} />
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-lbl">Cleanliness Score</span>
                  <span className="summary-val">{hygienePercent}%</span>
                </div>
                <div className="summary-progress-bar">
                  <div className="summary-progress-fill" style={{ width: `${hygienePercent}%`, backgroundColor: 'var(--saffron)' }} />
                </div>
              </div>
            </div>
          )}

          {avgPrice !== null && (
            <div className="summary-item">
              <div className="summary-icon-wrap">
                <Coins size={14} />
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-lbl">Price Level</span>
                  <span className="summary-val">{priceLabel}</span>
                </div>
                <div className="summary-price-indicator">
                  <span className={avgPrice >= 1 ? 'active' : ''}>₹</span>
                  <span className={avgPrice >= 2 ? 'active' : ''}>₹</span>
                  <span className={avgPrice >= 3 ? 'active' : ''}>₹</span>
                  <span className={avgPrice >= 4 ? 'active' : ''}>₹</span>
                </div>
              </div>
            </div>
          )}

          {avgStaff !== null && (
            <div className="summary-item">
              <div className="summary-icon-wrap">
                <Smile size={14} />
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-lbl">Staff Behaviour</span>
                  <span className="summary-val">{avgStaff} / 5</span>
                </div>
                <div className="summary-progress-bar">
                  <div className="summary-progress-fill" style={{ width: `${(parseFloat(avgStaff) / 5) * 100}%`, backgroundColor: 'var(--gold)' }} />
                </div>
              </div>
            </div>
          )}

          {commonWait !== null && (
            <div className="summary-item">
              <div className="summary-icon-wrap">
                <Timer size={14} />
              </div>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-lbl">Average Wait Time</span>
                  <span className="summary-val">{waitLabel}</span>
                </div>
                <div className="summary-wait-indicator">
                  <span className={`wait-segment ${commonWait === 'short' ? 'active' : ''}`} />
                  <span className={`wait-segment ${commonWait === 'medium' ? 'active' : ''}`} />
                  <span className={`wait-segment ${commonWait === 'long' ? 'active' : ''}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOpenHoursCard = () => {
    if (totalOpenReports === 0) return null;
    return (
      <div className="shop-summary-card">
        <h3 className="shop-summary-title">Hourly Open Rate</h3>
        {render24hChart()}
      </div>
    );
  };

  if (resolvingError) {
    return (
      <div className="empty-state" style={{ marginTop: '10vh' }}>
        <AlertCircle size={48} color="var(--deep-red)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '8px' }}>Shop Not Found</h3>
        <p style={{ color: 'var(--text)', marginBottom: '24px' }}>This link is invalid or the shop does not exist.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '10px 24px' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  if (!decodedUpiId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-light)' }}>
        <Loader size={32} className="spin" />
      </div>
    );
  }

  return (
    <motion.div className="shop-review-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* ── Back Nav ─────────────────────────────── */}
      <nav className="back-nav">
        <Link to="/" className="back-link">
          <ArrowLeft />
          Back to Home
        </Link>
      </nav>

      {/* ── Shop Header ──────────────────────────── */}
      <div className="shop-header">
        <motion.div className="shop-header-card" {...cardEntrance}>
          <div className="shop-image-banner">
            <img src="/shop-placeholder.png" alt={`${shopDisplayName} shop`} />
          </div>

          <div className="shop-header-content">
            <div className="shop-avatar">{shopDisplayName.charAt(0).toUpperCase()}</div>

            <div className="shop-info">
              {/* Inline editable name — Truecaller style */}
              <AnimatePresence mode="wait">
                {isEditingShopInfo ? (
                  <motion.div
                    key="edit"
                    className="shop-name-edit-wrap"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <input
                      className="shop-name-edit-input"
                      type="text"
                      value={suggestName}
                      onChange={(e) => setSuggestName(e.target.value)}
                      placeholder="Shop name"
                      maxLength={60}
                      autoFocus
                    />
                    <select
                      className="shop-type-edit-select"
                      value={suggestType || shopType}
                      onChange={(e) => setSuggestType(e.target.value)}
                    >
                      {SHOP_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div className="shop-name-edit-actions">
                      <button
                        className="edit-save-btn"
                        onClick={handleSuggestSubmit}
                        disabled={suggestSubmitting}
                      >
                        {suggestSubmitting ? <Loader size={13} className="spin" /> : <Check size={13} />}
                        Save
                      </button>
                      <button
                        className="edit-cancel-btn"
                        onClick={() => { setIsEditingShopInfo(false); setSuggestName(''); setSuggestType(''); }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="shop-name-row">
                      <h1 className="shop-name">{shopDisplayName}</h1>
                      {user && (
                        <button
                          className="shop-name-edit-icon"
                          onClick={() => { setSuggestName(shopDisplayName); setSuggestType(shopType); setIsEditingShopInfo(true); }}
                          aria-label="Suggest a name correction"
                          title="Suggest a correction"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                    <p className="shop-category">
                      <Store size={14} />
                      {shopTypeLabel}
                      {suggestDone && <span className="suggest-done-badge">Updated</span>}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="shop-badges-row">
                <Link
                  to={`/claim/${shopHash}`}
                  className="claim-shop-btn"
                  aria-label="Claim this shop as owner"
                >
                  <ShieldCheck size={13} />
                  Claim this Shop
                </Link>
              </div>
            </div>

            <div className="shop-rating-summary">
              <motion.div className="rating-big-number"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}>
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

      {/* ── Content Grid ─────────────────────────── */}
      <div className={`shop-content ${!hasReviews ? 'shop-content--empty' : ''}`}>

        {hasReviews && (
          <div className="shop-sidebar-stack">
            <motion.aside className="rating-distribution-card"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}>
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
                      <motion.div className="rating-bar-fill" data-rating={star}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} />
                    </div>
                    <span className="rating-bar-count">{pct}%</span>
                  </div>
                );
              })}
            </motion.aside>
            {renderSummaryCard()}
            {renderOpenHoursCard()}
          </div>
        )}

        <div className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Customer Reviews</h2>
            {hasReviews && (
              <select className="reviews-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>

          {loadingReviews ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
              <Loader size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: '#00897B' }} />
              <p>Loading reviews…</p>
            </div>
          ) : sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                voted={votedReviewIds.has(review.id)} 
                onHelpful={handleHelpful} 
              />
            ))
          ) : (
            <motion.div className="empty-state"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="empty-state__illustration"><EmptyStateIllustration /></div>
              <h3 className="empty-state__title">No Reviews Yet</h3>
              <p className="empty-state__subtitle">
                Be the first to review this shop and help your community make better choices.
              </p>
              <motion.button className="empty-state__cta"
                onClick={() => document.getElementById('add-review-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Send size={18} />
                Write the First Review
              </motion.button>
            </motion.div>
          )}

          {/* ── Add Review ─────────────────────────── */}
          <motion.div id="add-review-section" className="add-review-card"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5 }}>

            <h3 className="add-review-title">{existingUserReview ? 'Edit Your Review' : 'Write a Review'}</h3>
            <p className="add-review-subtitle">
              {existingUserReview ? 'Modify your rating and feedback below' : `Share your experience at ${shopDisplayName}`}
            </p>
            {existingUserReview && (
              <div className="review-edit-notice" style={{
                background: 'rgba(0, 137, 123, 0.05)',
                border: '1.5px solid rgba(0, 137, 123, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: '#00897B',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={16} />
                <span>You have already reviewed this shop. Editing your previous review.</span>
              </div>
            )}

            {/* Auth gate */}
            {!user && (
              <div className="auth-gate">
                <LogIn size={20} />
                <div>
                  <strong>Sign in to post a review</strong>
                  <p>Your review helps the community. You can still post anonymously after signing in.</p>
                </div>
                <button className="auth-gate-btn" onClick={() => setAuthModalOpen(true)}>
                  Sign in
                </button>
              </div>
            )}

            <fieldset className="review-form-fields" disabled={!user}>
              {/* Overall star rating */}
              <div className="form-group">
                <label className="form-label">Overall Rating</label>
                <StarRating rating={newRating} onRate={setNewRating} size={32} />
              </div>

              {/* Quick facts row */}
              <div className="form-group">
                <label className="form-label">Quick Facts</label>
                <div className="quick-facts-grid">
                  <div className="quick-fact">
                    <span className="qf-label">Shop open?</span>
                    <TriToggle value={isOpen === null ? '' : String(isOpen)}
                      onChange={(v) => setIsOpen(v === '' ? null : v === 'true')}
                      options={[{ value: 'true', label: 'Open' }, { value: 'false', label: 'Closed' }]} />
                  </div>
                  <div className="quick-fact">
                    <span className="qf-label">Hygienic?</span>
                    <TriToggle value={isHygienic === null ? '' : String(isHygienic)}
                      onChange={(v) => setIsHygienic(v === '' ? null : v === 'true')}
                      options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                  </div>
                  <div className="quick-fact">
                    <span className="qf-label">Would recommend?</span>
                    <TriToggle value={wouldRecommend === null ? '' : String(wouldRecommend)}
                      onChange={(v) => setWouldRecommend(v === '' ? null : v === 'true')}
                      options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                  </div>
                  <div className="quick-fact">
                    <span className="qf-label">Accepts UPI?</span>
                    <TriToggle value={String(acceptsUpi)}
                      onChange={(v) => setAcceptsUpi(v === 'true')}
                      options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                  </div>
                  <div className="quick-fact">
                    <span className="qf-label">Accepts Cash?</span>
                    <TriToggle value={acceptsCash === null ? '' : String(acceptsCash)}
                      onChange={(v) => setAcceptsCash(v === '' ? null : v === 'true')}
                      options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                  </div>
                </div>
              </div>

              {/* Price range */}
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <PriceRangePicker value={priceRange} onChange={setPriceRange} />
              </div>

              {/* Sub-ratings */}
              <div className="form-group">
                <label className="form-label">Service Quality</label>
                <div className="sub-ratings-stack">
                  <SubRating value={staffBehaviour} onChange={setStaffBehaviour} label="Staff behaviour" />
                  <div className="quick-fact" style={{ marginTop: 8 }}>
                    <span className="qf-label">Wait time</span>
                    <TriToggle value={waitTime}
                      onChange={setWaitTime}
                      options={[
                        { value: 'short', label: 'Short' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'long', label: 'Long' },
                      ]} />
                  </div>
                </div>
              </div>

              {/* Food-specific */}
              {isFood && (
                <div className="form-group form-group--contextual">
                  <label className="form-label form-label--context">
                    Food Details
                    <span className="context-badge">{shopTypeLabel}</span>
                  </label>
                  <div className="sub-ratings-stack">
                    <SubRating value={foodQuality} onChange={setFoodQuality} label="Food quality" />
                    <SubRating value={foodTaste} onChange={setFoodTaste} label="Taste" />
                    <div className="quick-fact" style={{ marginTop: 8 }}>
                      <span className="qf-label">Spice level</span>
                      <TriToggle value={foodSpice} onChange={setFoodSpice}
                        options={[
                          { value: 'mild', label: 'Mild' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'spicy', label: 'Spicy' },
                        ]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Kirana-specific */}
              {isKirana && (
                <div className="form-group form-group--contextual">
                  <label className="form-label form-label--context">
                    Stock Details
                    <span className="context-badge">{shopTypeLabel}</span>
                  </label>
                  <div className="sub-ratings-stack">
                    <div className="quick-fact">
                      <span className="qf-label">Stock level</span>
                      <TriToggle value={inventoryLevel} onChange={setInventoryLevel}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Good' },
                          { value: 'high', label: 'Excellent' },
                        ]} />
                    </div>
                    <SubRating value={freshness} onChange={setFreshness} label="Product freshness" />
                    <div className="quick-fact" style={{ marginTop: 8 }}>
                      <span className="qf-label">Discounts available?</span>
                      <TriToggle value={discountAvailable === null ? '' : String(discountAvailable)}
                        onChange={(v) => setDiscountAvailable(v === '' ? null : v === 'true')}
                        options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Pharmacy-specific */}
              {isPharmacy && (
                <div className="form-group form-group--contextual">
                  <label className="form-label form-label--context">
                    Medicine Availability
                    <span className="context-badge">Pharmacy</span>
                  </label>
                  <TriToggle value={medicineAvailability} onChange={setMedicineAvailability}
                    options={[
                      { value: 'poor', label: 'Poor' },
                      { value: 'average', label: 'Average' },
                      { value: 'good', label: 'Good' },
                    ]} />
                </div>
              )}

              {/* Salon-specific */}
              {isSalon && (
                <div className="form-group form-group--contextual">
                  <label className="form-label form-label--context">
                    Salon Details
                    <span className="context-badge">Salon</span>
                  </label>
                  <div className="sub-ratings-stack">
                    <SubRating value={skillLevel} onChange={setSkillLevel} label="Skill level" />
                    <div className="quick-fact" style={{ marginTop: 8 }}>
                      <span className="qf-label">Appointment needed?</span>
                      <TriToggle value={appointmentNeeded === null ? '' : String(appointmentNeeded)}
                        onChange={(v) => setAppointmentNeeded(v === '' ? null : v === 'true')}
                        options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'Walk-in' }]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Electronics-specific */}
              {isElectronics && (
                <div className="form-group form-group--contextual">
                  <label className="form-label form-label--context">
                    Repair Details
                    <span className="context-badge">{shopTypeLabel}</span>
                  </label>
                  <div className="sub-ratings-stack">
                    <SubRating value={repairQuality} onChange={setRepairQuality} label="Repair quality" />
                    <div className="quick-fact" style={{ marginTop: 8 }}>
                      <span className="qf-label">Warranty given?</span>
                      <TriToggle value={warrantyGiven === null ? '' : String(warrantyGiven)}
                        onChange={(v) => setWarrantyGiven(v === '' ? null : v === 'true')}
                        options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Visit type */}
              <div className="form-group">
                <label className="form-label">Visit frequency</label>
                <TriToggle value={visitType} onChange={setVisitType}
                  options={[
                    { value: 'first', label: 'First visit' },
                    { value: 'occasional', label: 'Occasional' },
                    { value: 'regular', label: 'Regular' },
                  ]} />
              </div>

              {/* Review text */}
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea
                  className="review-textarea"
                  placeholder="Tell others about your experience…"
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  Location <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                </label>
                <div className="location-row">
                  <button type="button" className="location-detect-btn" onClick={handleDetectLocation} disabled={locating}>
                    {locating ? <><Loader size={15} className="spin" /> Detecting…</> : <><Navigation size={15} /> Use My Location</>}
                  </button>
                  <input className="location-input" type="text"
                    placeholder="or type: Sector 22, Chandigarh"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)} />
                </div>
              </div>

              {/* Anonymous toggle — only shown when logged in */}
              {user && (
                <div className="form-group">
                  <label className="anon-toggle">
                    <input
                      type="checkbox"
                      checked={postAnonymously}
                      onChange={(e) => setPostAnonymously(e.target.checked)}
                    />
                    <span className="anon-toggle__label">
                      Post anonymously
                      <span className="anon-toggle__hint">
                        {postAnonymously ? 'Review will show as "Anonymous"' : `Review will show as "${displayName}"`}
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {/* Submit */}
              <motion.button
                className="submit-btn"
                onClick={handleSubmitReview}
                disabled={!canSubmit || submitting || !user}
                whileHover={canSubmit && !submitting && user ? { scale: 1.03 } : {}}
                whileTap={canSubmit && !submitting && user ? { scale: 0.97 } : {}}
              >
                {submitting ? <Loader size={18} className="spin" /> : <Send size={18} />}
                {submitting ? 'Saving…' : existingUserReview ? 'Update Review' : 'Submit Review'}
              </motion.button>
            </fieldset>
          </motion.div>
        </div>
      </div>

      {/* ── Toast ────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div className="success-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
            <div className="success-toast-icon"><CheckCircle /></div>
            <div className="success-toast-text">
              <strong>{existingUserReview ? 'Review updated!' : 'Review submitted!'}</strong>
              <span>Thank you for helping the community.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ───────────────────────────────── */}
      <OwnerQrModal isOpen={ownerModalOpen} onClose={() => setOwnerModalOpen(false)} upiId={decodedUpiId} shopName={shopDisplayName} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </motion.div>
  );
}
