import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShoppingBag, Store, Users, Smartphone } from 'lucide-react';
import './AboutPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function AboutPage() {
  /* ── JSON-LD Structured Data ─────────────────── */
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RateMyShop',
      url: 'https://ratemyshop.in',
      description:
        "India's first community-driven review platform for local shops. Rate any shop by scanning its UPI QR code.",
      foundingDate: '2025'
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  /* ── Page title ──────────────────────────────── */
  useEffect(() => {
    document.title = 'About — RateMyShop.in | Empowering Local Commerce';
  }, []);

  return (
    <motion.div
      className="about-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ════════════ HERO ════════════ */}
      <section className="about-section about-hero">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="hero-badge">
              <span className="hero-badge-dot" />
              Our Mission
            </span>
          </motion.div>

          <motion.h1 className="hero-headline" variants={fadeUp} custom={1}>
            Empowering{' '}
            <span className="hero-highlight">Local Commerce</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeUp} custom={2}>
            We're building India's first community-driven review platform for local
            shops. Because the kirana store you visit every day deserves the same
            transparency as any online marketplace.
          </motion.p>

          <motion.div className="hero-madhubani-bar" variants={fadeUp} custom={3}>
            <span /><span /><span /><span /><span />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ PROBLEM STATEMENT ════════════ */}
      <section className="about-problem">
        <div className="about-section">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.span className="section-label" variants={fadeUp} custom={0}>
              The Problem
            </motion.span>
            <motion.h2 className="section-title" variants={fadeUp} custom={1}>
              We review everything online — except the shops we actually visit
            </motion.h2>
          </motion.div>

          <motion.div
            className="problem-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Left — Illustration card */}
            <motion.div className="problem-illustration" variants={fadeUp} custom={0}>
              <div className="problem-contrast-container">
                <div className="contrast-card contrast-card--online">
                  <div className="contrast-card-header">
                    <CheckCircle2 className="contrast-icon online-icon" size={24} />
                    <h4>Amazon / Zomato</h4>
                  </div>
                  <p>
                    Thousands of reviews, star ratings, photos. You'd never buy a
                    ₹500 phone case without reading reviews first.
                  </p>
                </div>

                <div className="contrast-card contrast-card--offline">
                  <div className="contrast-card-header">
                    <XCircle className="contrast-icon offline-icon" size={24} />
                    <h4>Your neighbourhood kirana</h4>
                  </div>
                  <p>
                    Zero reviews. Zero ratings. You spend ₹5,000 a month there
                    and have no way to know if their prices are fair or service is reliable.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right — Content */}
            <motion.div className="problem-content" variants={fadeUp} custom={1}>
              <h3>The information gap in local commerce is massive</h3>
              <p>
                Think about it — you read 20 reviews before ordering biryani on Swiggy,
                but you have absolutely zero information about the medical store that
                sells you medicines, the electrician shop that wires your home, or the
                tailor who stitches your clothes.
              </p>
              <p>
                There's no platform where you can check if a local shop is trustworthy,
                fairly priced, or well-stocked. This information asymmetry hurts
                shoppers and honest shop owners alike.
              </p>

              <div className="problem-stat-row">
                <div className="problem-stat">
                  <span className="stat-number">6.3 Cr+</span>
                  <span className="stat-label">Local shops across India</span>
                </div>
                <div className="problem-stat">
                  <span className="stat-number">&lt; 1%</span>
                  <span className="stat-label">Have any online reviews</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ OUR SOLUTION ════════════ */}
      <section className="about-section about-solution">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.span className="section-label" variants={fadeUp} custom={0}>
            Our Solution
          </motion.span>
          <motion.h2 className="section-title" variants={fadeUp} custom={1}>
            Review any shop. Just scan the UPI QR.
          </motion.h2>
          <motion.p className="section-subtitle" style={{ margin: '0 auto' }} variants={fadeUp} custom={2}>
            Every local shop in India already has a UPI QR code. We use it as a
            unique identifier — no app download, no sign-up hassle, no complex
            onboarding.
          </motion.p>
        </motion.div>

        <motion.div
          className="solution-steps"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="solution-step" variants={fadeUp}>
            <div className="step-number step-1">1</div>
            <h3>Scan the QR</h3>
            <p>
              Walk into any shop and scan their UPI QR code — the same one you use
              for payments. That's all you need to find the shop on RateMyShop.
            </p>
          </motion.div>

          <motion.div className="solution-step" variants={fadeUp}>
            <div className="step-number step-2">2</div>
            <h3>Read & Write Reviews</h3>
            <p>
              See what others have said — ratings on pricing, quality, behaviour.
              Had a good experience? Share it. Had a bad one? Warn others.
            </p>
          </motion.div>

          <motion.div className="solution-step" variants={fadeUp}>
            <div className="step-number step-3">3</div>
            <h3>Help Your Community</h3>
            <p>
              Every review you leave helps your neighbours make better choices
              and motivates shop owners to improve. It's a virtuous cycle.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="solution-note"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span className="solution-note-icon"><Smartphone size={20} /></span>
          No app download needed — works entirely in the browser
        </motion.div>
      </section>

      {/* ════════════ HOW IT HELPS ════════════ */}
      <section className="about-helps">
        <div className="about-section">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.span className="section-label" variants={fadeUp} custom={0}>
              Who It Helps
            </motion.span>
            <motion.h2 className="section-title" variants={fadeUp} custom={1}>
              Built for the entire local ecosystem
            </motion.h2>
            <motion.p
              className="section-subtitle"
              style={{ margin: '0 auto' }}
              variants={fadeUp}
              custom={2}
            >
              RateMyShop creates value for shoppers, shop owners, and entire
              communities — making local commerce more transparent and trustworthy.
            </motion.p>
          </motion.div>

          <motion.div
            className="helps-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Card 1 — Shoppers */}
            <motion.div className="helps-card" variants={fadeUp}>
              <div className="helps-card-icon"><ShoppingBag size={28} /></div>
              <h3>For Shoppers</h3>
              <p>
                Make smarter choices with real reviews from your neighbours.
              </p>
              <ul>
                <li>Compare shops before visiting</li>
                <li>Know about pricing fairness</li>
                <li>Find trusted shops in a new area</li>
                <li>Avoid shops with recurring complaints</li>
              </ul>
            </motion.div>

            {/* Card 2 — Shop Owners */}
            <motion.div className="helps-card" variants={fadeUp}>
              <div className="helps-card-icon"><Store size={28} /></div>
              <h3>For Shop Owners</h3>
              <p>
                Build a digital reputation and get actionable feedback.
              </p>
              <ul>
                <li>Build trust with positive reviews</li>
                <li>Understand what customers really think</li>
                <li>Stand out from competing shops</li>
                <li>Attract new customers organically</li>
              </ul>
            </motion.div>

            {/* Card 3 — Communities */}
            <motion.div className="helps-card" variants={fadeUp}>
              <div className="helps-card-icon"><Users size={28} /></div>
              <h3>For Communities</h3>
              <p>
                Foster transparency and accountability in local commerce.
              </p>
              <ul>
                <li>Bring transparency to local markets</li>
                <li>Encourage fair pricing practices</li>
                <li>Create accountability for bad service</li>
                <li>Strengthen neighbourhood trust</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ VISION ════════════ */}
      <section className="about-section about-vision">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span className="section-label" variants={fadeUp} custom={0}>
            Our Vision
          </motion.span>

          <motion.div className="vision-card" variants={fadeUp} custom={1}>
            <h2>
              Every local shop in India,{' '}
              <span className="vision-highlight">reviewed & rated</span>
            </h2>
            <p>
              We envision a future where stepping into any shop — from a tiny
              paan stall in Varanasi to a bustling electronics market in
              Hyderabad — comes with the same confidence you feel shopping on
              Amazon. One review at a time, one shop at a time.
            </p>

            <div className="vision-stats">
              <div className="vision-stat">
                <span className="v-number">28+</span>
                <span className="v-label">States to cover</span>
              </div>
              <div className="vision-stat">
                <span className="v-number">6.3 Cr</span>
                <span className="v-label">Shops to map</span>
              </div>
              <div className="vision-stat">
                <span className="v-number">140 Cr</span>
                <span className="v-label">People to empower</span>
              </div>
            </div>

            <div className="vision-dots">
              <span /><span /><span /><span /><span /><span /><span />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
