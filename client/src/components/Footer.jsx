import { Link } from 'react-router-dom';
import { QrCode, MapPin, Heart, Star } from 'lucide-react';
import './Footer.css';

/* ── Madhubani top border ─────────────────────────── */
const MadhubaniTopBorder = () => (
  <div className="footer__madhubani-border" aria-hidden="true">
    <svg
      width="100%"
      height="36"
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="6" width="1200" height="1.5" fill="#F9A825" opacity="0.3" />
      <rect y="28" width="1200" height="1.5" fill="#F9A825" opacity="0.3" />
      {Array.from({ length: 24 }).map((_, i) => {
        const cx = i * 50 + 25;
        return (
          <g key={i}>
            <polygon
              points={`${cx - 8},10 ${cx + 8},10 ${cx},26`}
              fill={i % 4 === 0 ? '#00897B' : i % 4 === 1 ? '#1565C0' : i % 4 === 2 ? '#FF6B2B' : '#C62828'}
              opacity="0.5"
            />
            <circle cx={cx} cy="4" r="2" fill="#FF6B2B" opacity="0.45" />
            <circle cx={cx} cy="32" r="2.5" fill="#F9A825" opacity="0.5" />
            {i < 23 && (
              <path
                d={`M${cx + 12},18 Q${cx + 25},28 ${cx + 38},18`}
                stroke="#F9A825"
                strokeWidth="1.2"
                fill="none"
                opacity="0.3"
              />
            )}
          </g>
        );
      })}
    </svg>
  </div>
);

/* ── Mini QR brand icon ───────────────────────────── */
const BrandMark = () => (
  <div className="footer__brandmark" aria-hidden="true">
    <QrCode size={20} strokeWidth={1.8} />
  </div>
);

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <MadhubaniTopBorder />

      <div className="footer__body">
        <div className="footer__inner">

          {/* Brand column */}
          <div className="footer__col footer__col--brand">
            <div className="footer__logo-row">
              <BrandMark />
              <span className="footer__logo">RateMyShop</span>
            </div>
            <p className="footer__tagline">
              India's hyper-local shop review platform. Every QR code is a shop's unique identity - scan, review, trust.
            </p>
            <div className="footer__trust-badges">
              <span className="footer__badge">
                <Star size={12} />
                Community Reviews
              </span>
              <span className="footer__badge">
                <MapPin size={12} />
                Hyper-Local
              </span>
            </div>
          </div>

          {/* Navigation column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <ul className="footer__links-list">
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#faq">FAQ</a></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Resources column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links-list">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* For Shops column */}
          <div className="footer__col">
            <h4 className="footer__col-title">For Shops</h4>
            <p className="footer__col-desc">
              Already have a QR code at your counter? Your shop is already on RateMyShop. Claim your listing to see your reviews.
            </p>
            <Link to="/claim" className="footer__cta-btn">
              Claim Your Shop
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copy">
            © {currentYear} ratemyshop.in - All rights reserved
          </p>
          <p className="footer__made">
            Made with <Heart size={12} className="footer__heart" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
