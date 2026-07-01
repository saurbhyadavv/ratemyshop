import { useMemo } from 'react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';
import './RatingDistribution.css';

export default function RatingDistribution({ reviews = [] }) {
  const { counts, maxCount, average, total } = useMemo(() => {
    const c = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) c[star]++;
      sum += r.rating;
    });

    const t = reviews.length;
    const mx = Math.max(...Object.values(c), 1);
    const avg = t > 0 ? (sum / t).toFixed(1) : '0.0';

    return { counts: c, maxCount: mx, average: avg, total: t };
  }, [reviews]);

  return (
    <div className="ratingDistribution">
      {/* Overall rating summary */}
      <div className="overallRating">
        <motion.span
          className="overallNumber"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {average}
        </motion.span>
        <div className="overallMeta">
          <div className="overallStars">
            <StarRating rating={Math.round(parseFloat(average))} readonly size={20} />
          </div>
          <span className="totalReviews">
            {total} {total === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="barList">
        {[5, 4, 3, 2, 1].map((star, i) => {
          const count = counts[star];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div className="barRow" key={star}>
              <span className="barLabel">{star} star</span>
              <div className="barTrack">
                <motion.div
                  className="barFill"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
              <span className="barPercent">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
