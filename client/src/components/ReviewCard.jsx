import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import StarRating from './StarRating';
import './ReviewCard.css';

const PASTEL_COLORS = [
  '#FFE0B2', '#FFCCBC', '#F8BBD0', '#E1BEE7',
  '#C5CAE9', '#BBDEFB', '#B2DFDB', '#C8E6C9',
  '#FFF9C4', '#D7CCC8', '#F0F4C3', '#B3E5FC',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Just now') return 'Just now';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewCard({ review, voted = false, onHelpful }) {
  const {
    id, author, rating, date, text, helpful,
    price_range, is_hygienic, is_open, wait_time, would_recommend,
    food_spice, inventory_level, medicine_availability, appointment_needed, warranty_given
  } = review;

  const [votedLocal, setVotedLocal] = useState(voted);
  const [localHelpful, setLocalHelpful] = useState(helpful || 0);

  useEffect(() => {
    setVotedLocal(voted);
  }, [voted]);

  useEffect(() => {
    setLocalHelpful(helpful || 0);
  }, [helpful]);

  const avatarBg = useMemo(() => getAvatarColor(author || ''), [author]);
  const initial = (author || '?').charAt(0).toUpperCase();
  const formattedDate = useMemo(() => formatDate(date), [date]);

  const handleHelpfulClick = () => {
    if (votedLocal) return;
    setVotedLocal(true);
    setLocalHelpful((prev) => prev + 1);
    if (onHelpful) onHelpful(id);
  };

  return (
    <motion.div
      className="reviewCard"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="reviewHeader">
        <div className="avatar" style={{ background: avatarBg }}>
          {initial}
        </div>
        <div className="authorInfo">
          <div className="authorRow">
            <span className="authorName">{author}</span>
            <span className="reviewDate">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="ratingRow">
        <StarRating rating={rating} readonly size={18} />
      </div>

      {/* Structured review tags */}
      <div className="reviewTags">
        {price_range && <span className="reviewTag reviewTag--price">{"₹".repeat(price_range)}</span>}
        
        {is_hygienic !== null && is_hygienic !== undefined && (
          <span className={`reviewTag reviewTag--hygiene ${is_hygienic ? 'success' : 'danger'}`}>
            {is_hygienic ? 'Hygienic' : 'Unhygienic'}
          </span>
        )}

        {is_open !== null && is_open !== undefined && (
          <span className={`reviewTag reviewTag--open ${is_open ? 'success' : 'danger'}`}>
            {is_open ? 'Open' : 'Closed'}
          </span>
        )}

        {wait_time && (
          <span className="reviewTag reviewTag--wait">
            {wait_time === 'short' ? 'Quick Service' : wait_time === 'medium' ? 'Average Wait' : 'Slow Service'}
          </span>
        )}

        {would_recommend !== null && would_recommend !== undefined && (
          <span className={`reviewTag reviewTag--recommend ${would_recommend ? 'success' : 'danger'}`}>
            {would_recommend ? '👍 Recommends' : '👎 Dislikes'}
          </span>
        )}

        {/* Category specific details */}
        {food_spice && <span className="reviewTag reviewTag--context">Spice: {food_spice}</span>}
        {inventory_level && <span className="reviewTag reviewTag--context">Stock: {inventory_level}</span>}
        {medicine_availability && <span className="reviewTag reviewTag--context">Meds: {medicine_availability}</span>}
        {appointment_needed !== null && appointment_needed !== undefined && (
          <span className="reviewTag reviewTag--context">{appointment_needed ? 'Appt. Required' : 'Walk-in OK'}</span>
        )}
        {warranty_given !== null && warranty_given !== undefined && (
          <span className="reviewTag reviewTag--context">{warranty_given ? 'Warranty Given' : 'No Warranty'}</span>
        )}
      </div>

      <p className="reviewText">{text}</p>

      <div className="reviewFooter">
        <motion.button
          className={`helpfulBtn ${votedLocal ? 'helpfulBtn--active' : ''}`}
          type="button"
          onClick={handleHelpfulClick}
          disabled={votedLocal}
          whileTap={!votedLocal ? { scale: 0.9 } : {}}
        >
          <ThumbsUp />
          {votedLocal ? 'Thanked!' : 'Helpful'}
        </motion.button>
        {localHelpful > 0 && (
          <span className="helpfulCount">
            {localHelpful} {localHelpful === 1 ? 'person' : 'people'} found this helpful
          </span>
        )}
      </div>
    </motion.div>
  );
}
