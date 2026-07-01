import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, ScanLine, ChevronRight } from 'lucide-react';
import UpiInput from './UpiInput';
import QrScanner from './QrScanner';
import './Hero.css';

/* ── Madhubani Background SVG Pattern ─────────────── */
const MadhubaniBg = () => (
  <svg
    className="hero__madhubani-bg"
    viewBox="0 0 800 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {[0, 200, 400, 600].map((x) =>
      [0, 200, 400, 600].map((y) => (
        <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
          <path
            d="M60 30 Q90 0 100 40 Q110 80 80 100 Q50 110 40 80 Q30 50 60 30Z"
            fill="#FF6B2B"
            opacity="0.5"
          />
          <path
            d="M65 45 Q80 30 85 50 Q90 70 75 80 Q60 85 55 70 Q50 55 65 45Z"
            fill="#F9A825"
            opacity="0.6"
          />
          <circle cx="72" cy="60" r="5" fill="#C62828" opacity="0.5" />
          <circle cx="40" cy="30" r="3" fill="#00897B" opacity="0.4" />
          <circle cx="110" cy="90" r="3" fill="#1565C0" opacity="0.4" />
          <ellipse cx="130" cy="50" rx="15" ry="6" fill="#00897B" opacity="0.3" transform="rotate(30 130 50)" />
          <ellipse cx="30" cy="110" rx="15" ry="6" fill="#F9A825" opacity="0.3" transform="rotate(-20 30 110)" />
          <path d="M140 120 Q160 100 180 120" stroke="#FF6B2B" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M145 130 Q160 115 175 130" stroke="#C62828" strokeWidth="1.5" fill="none" opacity="0.3" />
        </g>
      ))
    )}
  </svg>
);

/* ── Madhubani Section Divider ────────────────────── */
const MadhubaniDivider = () => (
  <div className="hero__divider">
    <svg
      width="100%"
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect y="8" width="1200" height="2" fill="#F9A825" opacity="0.4" />
      <rect y="30" width="1200" height="2" fill="#F9A825" opacity="0.4" />
      {Array.from({ length: 24 }).map((_, i) => {
        const cx = i * 50 + 25;
        return (
          <g key={i}>
            <polygon
              points={`${cx},12 ${cx - 8},28 ${cx + 8},28`}
              fill={i % 4 === 0 ? '#FF6B2B' : i % 4 === 1 ? '#C62828' : i % 4 === 2 ? '#00897B' : '#1565C0'}
              opacity="0.6"
            />
            <circle cx={cx} cy="6" r="2.5" fill="#F9A825" opacity="0.7" />
            <circle cx={cx} cy="36" r="2" fill="#FF6B2B" opacity="0.5" />
            {i < 23 && (
              <path
                d={`M${cx + 12},20 Q${cx + 25},10 ${cx + 38},20`}
                stroke="#F9A825"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
              />
            )}
          </g>
        );
      })}
    </svg>
  </div>
);

/* ── Corner decorations ───────────────────────────── */
const CornerDecor = ({ position }) => (
  <svg
    className={`hero__corner hero__corner--${position}`}
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M0 0 Q40 5 75 0" stroke="#FF6B2B" strokeWidth="2" opacity="0.2" fill="none" />
    <path d="M0 0 Q5 40 0 75" stroke="#F9A825" strokeWidth="2" opacity="0.2" fill="none" />
    <circle cx="8" cy="8" r="3" fill="#FF6B2B" opacity="0.25" />
    <circle cx="20" cy="4" r="2" fill="#F9A825" opacity="0.25" />
    <circle cx="4" cy="20" r="2" fill="#C62828" opacity="0.25" />
  </svg>
);

/* ── Animated QR Scanner Visual ──────────────────── */
const QrScannerVisual = ({ onClick }) => (
  <motion.div
    className="hero__qr-visual"
    onClick={onClick}
    whileHover={{ scale: 1.03, boxShadow: '0 20px 50px rgba(255,107,43,0.18)' }}
    whileTap={{ scale: 0.98 }}
  >
    {/* QR frame corners */}
    <div className="hero__qr-frame">
      <div className="hero__qr-corner hero__qr-corner--tl" />
      <div className="hero__qr-corner hero__qr-corner--tr" />
      <div className="hero__qr-corner hero__qr-corner--bl" />
      <div className="hero__qr-corner hero__qr-corner--br" />

      {/* Scan line animation */}
      <motion.div
        className="hero__qr-scanline"
        animate={{ y: [0, 140, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center QR icon */}
      <div className="hero__qr-center">
        <QrCode size={48} strokeWidth={1.5} />
      </div>
    </div>

    <div className="hero__qr-label">
      <ScanLine size={18} />
      <span>Tap to Scan UPI QR Code</span>
      <ChevronRight size={16} />
    </div>
  </motion.div>
);

/* ── Animation Variants ──────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const lineVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Divider text ────────────────────────────────── */
const OrDivider = () => (
  <div className="hero__or-divider">
    <span className="hero__or-line" />
    <span className="hero__or-text">or enter UPI ID manually</span>
    <span className="hero__or-line" />
  </div>
);

function Hero() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleScan = (upiId) => {
    setScannerOpen(false);
    if (upiId) navigate(`/shop/${encodeURIComponent(upiId)}`);
  };

  return (
    <section className="hero">
      <MadhubaniBg />
      <CornerDecor position="top-left" />
      <CornerDecor position="top-right" />

      <div className="hero__content">
        <motion.div
          className="hero__headlines"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="hero__title" variants={lineVariants}>
            Rate Any Shop.
          </motion.h1>
          <motion.h1 className="hero__title hero__title--accent" variants={lineVariants}>
            Just Scan the UPI.
          </motion.h1>
          <motion.p className="hero__subtitle" variants={lineVariants}>
            India's first community-driven review platform for local shops.
            No app needed — just scan or enter a UPI ID to share your experience.
          </motion.p>
        </motion.div>

        {/* Primary CTA: QR Scanner Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <QrScannerVisual onClick={() => setScannerOpen(true)} />
        </motion.div>

        {/* Or divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <OrDivider />
        </motion.div>

        {/* Secondary: UPI Input */}
        <div id="upi-input-section" className="hero__input-wrap">
          <UpiInput />
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      <MadhubaniDivider />
    </section>
  );
}

export default Hero;
