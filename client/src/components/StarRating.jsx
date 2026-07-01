import { useState } from 'react';
import { motion } from 'framer-motion';
import './StarRating.css';

const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z';

export default function StarRating({ rating = 0, onRate, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  const getFill = (index) => {
    if (index <= displayRating) {
      if (!readonly && hovered >= index) return '#FBC02D';
      return '#F9A825';
    }
    return '#E2E8F0';
  };

  const getStroke = (index) => {
    if (index <= displayRating) {
      if (!readonly && hovered >= index) return '#F9A825';
      return '#F57F17';
    }
    return '#CBD5E1';
  };

  return (
    <div
      className="starRating"
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          className={`starWrapper ${readonly ? 'readonly' : ''}`}
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.85 } : {}}
          animate={
            !readonly && star === rating
              ? { scale: [1, 1.3, 0.9, 1.05, 1], transition: { duration: 0.4 } }
              : {}
          }
          onMouseEnter={() => !readonly && setHovered(star)}
          onClick={() => {
            if (!readonly && onRate) onRate(star);
          }}
        >
          <svg
            className="starSvg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={getFill(star)}
            stroke={getStroke(star)}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d={STAR_PATH} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
