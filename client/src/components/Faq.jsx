import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  Users,
  Globe,
  Eye,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import './Faq.css';

const faqs = [
  {
    icon: QrCode,
    question: 'How does RateMyShop identify a shop?',
    answer:
      "Every shop in India has a QR code at the counter used for UPI payments. We use that QR code as the shop's unique identifier — the same way a phone number identifies a person. When you scan it, we look up reviews for that specific shop. No payment happens.",
    color: '#FF6B2B',
  },
  {
    icon: CreditCard,
    question: 'Does scanning the QR code make any payment?',
    answer:
      'Absolutely not. RateMyShop never initiates, requests, or processes any payment. We only read the shop identity encoded in the QR. There are no transactions of any kind on our platform.',
    color: '#C62828',
  },
  {
    icon: ShieldCheck,
    question: 'Are reviews authentic and not fake?',
    answer:
      'Reviews are tied to the physical act of being at the shop — you have to scan the QR code present there. This naturally filters out remote fake reviews. Sign-in is required to post, creating accountability. Community votes help surface the most helpful reviews.',
    color: '#00897B',
  },
  {
    icon: Eye,
    question: 'Can I read reviews without signing in?',
    answer:
      'Yes! Anyone can browse and read all reviews without any account. Sign-in is only required when you want to post a review, vote a review as helpful, or suggest a shop name or category.',
    color: '#1565C0',
  },
  {
    icon: Users,
    question: 'Can I post a review anonymously?',
    answer:
      "Yes. When submitting a review, you'll see an option to post anonymously. Your account is still needed for accountability, but your public identity is hidden — only 'Anonymous' appears on the review.",
    color: '#FF6B2B',
  },
  {
    icon: Globe,
    question: 'Which shops are supported?',
    answer:
      'Any shop or vendor that displays a QR code (UPI, Paytm, PhonePe, Google Pay, etc.) can be reviewed — kiranas, dhabas, salons, pharmacies, vegetable vendors, repair shops, and more. If it has a QR, it can be reviewed.',
    color: '#00897B',
  },
  {
    icon: MessageSquare,
    question: 'What kind of details can I review?',
    answer:
      'You can rate overall quality plus up to 25 specific data points depending on shop type: hygiene, price range, wait time, staff behaviour, food quality, spice level, inventory availability, and much more. Your review becomes a rich data source for the community.',
    color: '#C62828',
  },
  {
    icon: HelpCircle,
    question: 'What if the shop name is wrong or unknown?',
    answer:
      "Shop names are crowd-sourced. If you know the correct name or type, logged-in users can click the edit icon next to the shop name and suggest a correction. The most agreed-upon name from the community wins.",
    color: '#1565C0',
  },
];

/* Decorative underline */
const DecorUnderline = () => (
  <svg
    className="faq__underline"
    width="80"
    height="10"
    viewBox="0 0 80 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M0 5 Q20 0 40 5 Q60 10 80 5" stroke="#FF6B2B" strokeWidth="2.5" fill="none" />
    <circle cx="0" cy="5" r="2.5" fill="#F9A825" />
    <circle cx="40" cy="5" r="2.5" fill="#C62828" />
    <circle cx="80" cy="5" r="2.5" fill="#00897B" />
  </svg>
);

function FaqItem({ faq, isOpen, onToggle, index }) {
  const Icon = faq.icon;
  return (
    <motion.div
      className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      style={{ '--faq-accent': faq.color }}
    >
      <button
        className="faq__question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="faq__question-left">
          <span className="faq__icon-wrap" style={{ background: `${faq.color}12`, color: faq.color }}>
            <Icon size={18} />
          </span>
          <span className="faq__question-text">{faq.question}</span>
        </div>
        <motion.span
          className="faq__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq__answer"
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="faq__answer-text">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="faq" id="faq">
      {/* Madhubani top border */}
      <div className="faq__madhubani-bar" aria-hidden="true">
        <svg width="100%" height="6" viewBox="0 0 1200 6" preserveAspectRatio="none">
          <rect width="1200" height="6" fill="url(#faqGrad)" />
          <defs>
            <linearGradient id="faqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B2B" />
              <stop offset="33%" stopColor="#F9A825" />
              <stop offset="66%" stopColor="#00897B" />
              <stop offset="100%" stopColor="#1565C0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="faq__inner">
        <motion.div
          className="faq__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="faq__title">Frequently Asked Questions</h2>
          <DecorUnderline />
          <p className="faq__lead">
            Everything you need to know about how RateMyShop works and why it's safe.
          </p>
        </motion.div>

        <div className="faq__list">
          {faqs.map((faq, i) => (
            <FaqItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
