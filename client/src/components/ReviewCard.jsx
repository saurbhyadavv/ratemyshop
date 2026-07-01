import { useState, useMemo } from 'react';
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
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewCard({ review, onHelpful }) {
  const { id, author, rating, date, text, helpful } = review;
  const [voted, setVoted] = useState(false);
  const [localHelpful, setLocalHelpful] = useState(helpful || 0);

  const avatarBg = useMemo(() => getAvatarColor(author || ''), [author]);
  const initial = (author || '?').charAt(0).toUpperCase();
  const formattedDate = useMemo(() => formatDate(date), [date]);

  const handleHelpfulClick = () => {
    if (voted) return;
    setVoted(true);
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

      <p className="reviewText">{text}</p>

      <div className="reviewFooter">
        <motion.button
          className={`helpfulBtn ${voted ? 'helpfulBtn--active' : ''}`}
          type="button"
          onClick={handleHelpfulClick}
          disabled={voted}
          whileTap={!voted ? { scale: 0.9 } : {}}
        >
          <ThumbsUp />
          {voted ? 'Thanked!' : 'Helpful'}
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
