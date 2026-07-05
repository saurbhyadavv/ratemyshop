import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Store, Mail, Phone, User,
  FileText, ArrowLeft, CheckCircle, Loader,
  Star, TrendingUp, MessageSquare, Link2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ClaimPage.css';

/* ── Madhubani Background SVG Pattern ─────────────── */
const MadhubaniBg = () => (
  <svg
    className="claim__madhubani-bg"
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

/* ── Corner decorations ───────────────────────────── */
const CornerDecor = ({ position }) => (
  <svg
    className={`claim__corner claim__corner--${position}`}
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

/* Benefits list for shop owners */
const BENEFITS = [
  { icon: Star, title: 'Monitor reputation', desc: 'Get notified when new reviews come in and track ratings.' },
  { icon: MessageSquare, title: 'Respond to reviews', desc: 'Reply publicly to customer feedback to build trust.' },
  { icon: TrendingUp, title: 'Community insights', desc: 'See metrics on hygiene, busy hours, and pricing.' }
];

export default function ClaimPage() {
  const { shopHash } = useParams();
  const { user } = useAuth();

  const [form, setForm] = useState({
    ownerName: '',
    businessName: '',
    email: user?.email || '',
    phone: '',
    driveLink: '',
    verificationNote: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ownerName.trim() || !form.email.trim() || !form.phone.trim() || !form.driveLink.trim()) {
      setError('Please fill in all required fields, including the Google Drive proof link.');
      return;
    }

    setSubmitting(true);
    setError('');

    const combinedNote = `Google Drive Proof: ${form.driveLink.trim()}\n\nNote: ${form.verificationNote.trim()}`;

    try {
      const { error: dbErr } = await supabase.from('shop_claims').insert({
        shop_hash: shopHash,
        owner_name: form.ownerName.trim(),
        business_name: form.businessName.trim() || null,
        contact_email: form.email.trim(),
        contact_phone: form.phone.trim(),
        verification_note: combinedNote,
        user_id: user?.id || null,
        status: 'pending'
      });

      if (dbErr) throw dbErr;
      setSubmitted(true);
    } catch (err) {
      console.error('Claim submission error:', err);
      setError('Failed to submit claim request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Mode 1: No shopHash - Simple Instruction Page ── */
  if (!shopHash) {
    return (
      <motion.div
        className="claim-page claim-page--simple"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MadhubaniBg />
        <CornerDecor position="top-left" />
        <CornerDecor position="top-right" />
        <div className="claim__inner">
          <div className="claim__content">
            <div className="claim__icon">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h1 className="claim__title">Claim Your Shop</h1>
            <p className="claim__desc">
              To claim a shop, first open its review page and click the teal "Claim this Shop" button below the shop name.
            </p>
            <Link to="/" className="claim__home-btn">
              Go to Home
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Success State for Form Submission ── */
  if (submitted) {
    return (
      <motion.div
        className="claim-page claim-page--success"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MadhubaniBg />
        <div className="claim__inner">
          <div className="claim__success-card">
            <div className="claim__success-icon">
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            <h2 className="claim__success-title">Claim Submitted!</h2>
            <p className="claim__success-desc">
              We have received your claim request. Our team will verify ownership and get back to you at <strong>{form.email}</strong> within 1-2 business days.
            </p>
            <Link to={`/shop/${shopHash}`} className="claim__back-btn">
              <ArrowLeft size={16} />
              Back to Shop Reviews
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Mode 2: With shopHash - Detailed Themed Claim Form ── */
  return (
    <motion.div
      className="claim-page claim-page--form"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MadhubaniBg />
      <CornerDecor position="top-left" />
      <CornerDecor position="top-right" />
      <div className="claim__inner claim__inner--large">
        <Link to={`/shop/${shopHash}`} className="claim__breadcrumb">
          <ArrowLeft size={15} />
          Back to Shop Reviews
        </Link>

        <div className="claim__layout">
          {/* Left panel: Info */}
          <div className="claim__sidebar">
            <div className="claim__sidebar-header">
              <div className="claim__shield-icon">
                <ShieldCheck size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="claim__sidebar-title">Verification Request</h1>
                <p className="claim__sidebar-subtitle">Unlock your merchant dashboard</p>
              </div>
            </div>

            <div className="claim__benefits-list">
              {BENEFITS.map((b) => (
                <div key={b.title} className="claim__benefit-item">
                  <div className="claim__benefit-item-icon">
                    <b.icon size={16} />
                  </div>
                  <div>
                    <h4 className="claim__benefit-item-title">{b.title}</h4>
                    <p className="claim__benefit-item-desc">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="claim__info-disclaimer">
              <h4>Ownership validation</h4>
              <p>
                To protect local merchants, we verify each claim manually. Please provide proof of business ownership (e.g., GST registration, utility bill, or UPI merchant dashboard screenshot) via a Google Drive link.
              </p>
            </div>
          </div>

          {/* Right panel: Form */}
          <div className="claim__form-container">
            <h2 className="claim__form-header-title">Claim Form</h2>
            <p className="claim__form-header-desc">
              Submit your request to link this shop profile to your account.
            </p>

            <form className="claim__form-element" onSubmit={handleSubmit} noValidate>
              <div className="claim__input-field">
                <label className="claim__input-label" htmlFor="ownerName">
                  <User size={14} /> Full Name *
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="claim__input-field">
                <label className="claim__input-label" htmlFor="businessName">
                  <Store size={14} /> Registered Business Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="e.g. Ramesh Kirana & general Store"
                  value={form.businessName}
                  onChange={handleChange}
                />
              </div>

              <div className="claim__input-row">
                <div className="claim__input-field">
                  <label className="claim__input-label" htmlFor="email">
                    <Mail size={14} /> Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="claim__input-field">
                  <label className="claim__input-label" htmlFor="phone">
                    <Phone size={14} /> Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="claim__input-field">
                <label className="claim__input-label" htmlFor="driveLink">
                  <Link2 size={14} /> Google Drive Link of Proof *
                </label>
                <input
                  id="driveLink"
                  name="driveLink"
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={form.driveLink}
                  onChange={handleChange}
                  required
                />
                <span className="claim__input-hint">
                  Ensure link sharing is set to "Anyone with the link" so our moderators can view it.
                </span>
              </div>

              <div className="claim__input-field">
                <label className="claim__input-label" htmlFor="verificationNote">
                  <FileText size={14} /> Additional Note (Optional)
                </label>
                <textarea
                  id="verificationNote"
                  name="verificationNote"
                  placeholder="Any additional context to help us verify your shop ownership."
                  value={form.verificationNote}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {error && <div className="claim__form-error">{error}</div>}

              <button
                type="submit"
                className="claim__submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader size={16} className="claim__spin" /> Submitting...</>
                ) : (
                  <><ShieldCheck size={16} /> Submit Claim Request</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
