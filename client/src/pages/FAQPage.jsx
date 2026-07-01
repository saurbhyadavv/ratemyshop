import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './FAQPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const faqCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    questions: [
      {
        q: 'What is RateMyShop?',
        a: 'RateMyShop is India\'s first community-driven review platform for local shops. You can rate and review any shop — from kirana stores to salons — by simply scanning or entering its UPI ID. No app download required.',
      },
      {
        q: 'How do I review a shop?',
        a: 'Visit ratemyshop.in, scan the shop\'s UPI QR code or type the UPI ID (e.g., shopname@paytm). You\'ll see existing reviews and can add your own rating (1-5 stars) and written review.',
      },
      {
        q: 'Do I need to download an app?',
        a: 'No. RateMyShop works entirely in your browser. Just visit ratemyshop.in on any phone or computer.',
      },
      {
        q: 'Is RateMyShop free to use?',
        a: 'Yes, completely free. There are no charges for reading or writing reviews.',
      },
    ],
  },
  {
    title: 'Reviews & Ratings',
    icon: '⭐',
    questions: [
      {
        q: 'Are the reviews anonymous?',
        a: 'Yes. Currently all reviews are submitted anonymously. We plan to add optional sign-in for verified reviews in the future.',
      },
      {
        q: 'Can shop owners delete negative reviews?',
        a: 'No. Shop owners cannot delete or modify any reviews. All reviews are permanent and visible to everyone.',
      },
      {
        q: 'How is the overall rating calculated?',
        a: 'The overall rating is a simple average of all individual star ratings submitted by users. For example, if a shop has five 5-star reviews and five 3-star reviews, the overall rating is 4.0.',
      },
      {
        q: 'What makes a good review?',
        a: 'Be specific. Mention what you bought, the pricing, the owner\'s behavior, shop cleanliness, and whether you\'d visit again. Avoid vague statements like "good shop" — details help other shoppers.',
      },
    ],
  },
  {
    title: 'UPI & Shop Identification',
    icon: '🏪',
    questions: [
      {
        q: 'Why does RateMyShop use UPI IDs?',
        a: 'Every shop in India that accepts digital payments has a unique UPI ID. This serves as a universal identifier — no need for the shop to register, create accounts, or claim listings. If a shop has a UPI QR code, it can be reviewed.',
      },
      {
        q: 'What if a shop has multiple UPI IDs?',
        a: 'Each UPI ID creates a separate listing. If a shop uses shopname@paytm and shopname@ybl, those will be two separate review pages. We recommend reviewing the UPI ID that is most prominently displayed at the shop.',
      },
      {
        q: 'Can I review a shop that doesn\'t have UPI?',
        a: 'Currently, no. A UPI ID is required to identify the shop. Since over 300 million merchants in India accept UPI, most shops are already covered.',
      },
    ],
  },
  {
    title: 'Trust & Safety',
    icon: '🛡️',
    questions: [
      {
        q: 'How do you prevent fake reviews?',
        a: 'We use a combination of rate limiting, device fingerprinting, and community moderation. In the future, verified sign-in will add another layer of trust.',
      },
      {
        q: 'Can I report a review?',
        a: 'This feature is coming soon. For now, the community self-moderates through the "Helpful" button — genuine reviews get voted up.',
      },
      {
        q: 'Is my data safe?',
        a: 'We do not collect personal data. Reviews are anonymous. We do not track your location unless you explicitly choose to share it when writing a review.',
      },
    ],
  },
  {
    title: 'For Shop Owners',
    icon: '🏷️',
    questions: [
      {
        q: 'How do I get my shop listed?',
        a: 'You don\'t need to do anything. If your shop has a UPI ID and someone reviews it, your shop is automatically listed on RateMyShop.',
      },
      {
        q: 'Can I respond to reviews?',
        a: 'Not yet, but we\'re building a shop owner dashboard where you can claim your shop, respond to reviews, and view analytics.',
      },
      {
        q: 'Does RateMyShop charge shops?',
        a: 'No. RateMyShop is free for both shoppers and shop owners. We have no plans to charge shops for basic listings.',
      },
    ],
  },
];

/* Build the JSON-LD structured data for all 17 questions */
const allQuestions = faqCategories.flatMap((cat) => cat.questions);
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQuestions.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

function AccordionItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
      <button
        className="faq-item__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="faq-item__question">{question}</span>
        <motion.span
          className="faq-item__icon"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
            className="faq-item__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="faq-item__answer">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  /* Inject JSON-LD and page title */
  useEffect(() => {
    document.title = 'FAQ — RateMyShop | Review Local Indian Shops by UPI ID';
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleToggle = (globalIndex) => {
    setOpenIndex((prev) => (prev === globalIndex ? null : globalIndex));
  };

  let globalIndex = 0;

  return (
    <motion.main
      className="faq-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >


      {/* Hero section */}
      <section className="faq-hero">
        <div className="faq-hero__accent faq-hero__accent--left" aria-hidden="true" />
        <div className="faq-hero__accent faq-hero__accent--right" aria-hidden="true" />

        <motion.h1
          className="faq-hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Frequently Asked <span className="faq-hero__highlight">Questions</span>
        </motion.h1>
        <motion.p
          className="faq-hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Everything you need to know about reviewing local shops on RateMyShop
        </motion.p>
      </section>

      {/* FAQ categories */}
      <section className="faq-content">
        {faqCategories.map((category, catIdx) => {
          const startIndex = globalIndex;
          const items = category.questions.map((item, qIdx) => {
            const idx = startIndex + qIdx;
            return (
              <AccordionItem
                key={idx}
                question={item.q}
                answer={item.a}
                isOpen={openIndex === idx}
                onToggle={() => handleToggle(idx)}
                index={idx}
              />
            );
          });
          globalIndex = startIndex + category.questions.length;

          return (
            <motion.div
              className="faq-category"
              key={catIdx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: catIdx * 0.08, duration: 0.5 }}
            >
              <h2 className="faq-category__title">
                <span className="faq-category__icon" aria-hidden="true">
                  {category.icon}
                </span>
                {category.title}
              </h2>
              <div className="faq-category__list">{items}</div>
            </motion.div>
          );
        })}
      </section>

      {/* CTA */}
      <section className="faq-cta">
        <motion.div
          className="faq-cta__card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="faq-cta__title">Still have questions?</h2>
          <p className="faq-cta__text">
            Reach out to us and we'll get back to you as soon as possible.
          </p>
          <a href="mailto:hello@ratemyshop.in" className="faq-cta__button">
            Contact Us
          </a>
        </motion.div>
      </section>
    </motion.main>
  );
}
