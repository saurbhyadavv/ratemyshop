import './Footer.css';

/* ── Madhubani Footer Border ──────────────────────── */
const MadhubaniTopBorder = () => (
  <div className="footer__madhubani-border">
    <svg
      width="100%"
      height="36"
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Lines */}
      <rect y="6" width="1200" height="1.5" fill="#F9A825" opacity="0.35" />
      <rect y="28" width="1200" height="1.5" fill="#F9A825" opacity="0.35" />

      {/* Inverted triangles and dots */}
      {Array.from({ length: 24 }).map((_, i) => {
        const cx = i * 50 + 25;
        return (
          <g key={i}>
            {/* Inverted triangle (pointing up) */}
            <polygon
              points={`${cx - 8},10 ${cx + 8},10 ${cx},26`}
              fill={
                i % 4 === 0
                  ? '#00897B'
                  : i % 4 === 1
                    ? '#1565C0'
                    : i % 4 === 2
                      ? '#FF6B2B'
                      : '#C62828'
              }
              opacity="0.55"
            />
            {/* Dot above */}
            <circle cx={cx} cy="4" r="2" fill="#FF6B2B" opacity="0.5" />
            {/* Dot below */}
            <circle cx={cx} cy="32" r="2.5" fill="#F9A825" opacity="0.6" />
            {/* Arcs */}
            {i < 23 && (
              <path
                d={`M${cx + 12},18 Q${cx + 25},28 ${cx + 38},18`}
                stroke="#F9A825"
                strokeWidth="1.2"
                fill="none"
                opacity="0.35"
              />
            )}
          </g>
        );
      })}
    </svg>
  </div>
);

function Footer() {
  return (
    <footer className="footer">
      <MadhubaniTopBorder />

      <div className="footer__body">
        <div className="footer__inner">
          {/* Left column */}
          <div className="footer__col footer__col--brand">
            <span className="footer__logo">RateMyShop</span>
            <p className="footer__tagline">
              Empowering local commerce through community reviews.
            </p>
          </div>

          {/* Middle column */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links-list">
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
            </ul>
          </div>

          {/* Right column */}
          <div className="footer__col footer__col--right">
            <p className="footer__made-in">
              Made with ❤️ in India 🇮🇳
            </p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2025 ratemyshop.in</p>
      </div>
    </footer>
  );
}

export default Footer;
