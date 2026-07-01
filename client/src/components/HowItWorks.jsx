import { motion } from 'framer-motion';
import { QrCode, Star, MessageSquarePlus } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: QrCode,
    title: 'Scan or Enter UPI',
    description:
      "Point your camera at the shop's UPI QR code, or simply type their UPI ID",
    step: 1,
  },
  {
    icon: Star,
    title: 'Read Reviews',
    description:
      'See what other customers think about the shop — ratings, experiences, and tips',
    step: 2,
  },
  {
    icon: MessageSquarePlus,
    title: 'Share Your Experience',
    description:
      'Leave your own review to help the community make better choices',
    step: 3,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* Decorative underline SVG */
const DecorUnderline = () => (
  <svg
    className="hiw__underline"
    width="120"
    height="10"
    viewBox="0 0 120 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M0 5 Q30 0 60 5 Q90 10 120 5" stroke="#FF6B2B" strokeWidth="2.5" fill="none" />
    <circle cx="0" cy="5" r="2.5" fill="#F9A825" />
    <circle cx="60" cy="5" r="2.5" fill="#C62828" />
    <circle cx="120" cy="5" r="2.5" fill="#00897B" />
  </svg>
);

function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="hiw__inner">
        <motion.div
          className="hiw__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="hiw__title">How It Works</h2>
          <DecorUnderline />
        </motion.div>

        <div className="hiw__steps">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="hiw__card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <div className="hiw__icon-wrap">
                <div className="hiw__icon">
                  <step.icon size={28} />
                </div>
                <span className="hiw__badge">{step.step}</span>
              </div>
              <h3 className="hiw__card-title">{step.title}</h3>
              <p className="hiw__card-desc">{step.description}</p>

              {/* Connector arrow (not on last) */}
              {i < steps.length - 1 && (
                <div className="hiw__connector" aria-hidden="true">
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                    <path d="M0 10 L30 10" stroke="#F9A825" strokeWidth="2" strokeDasharray="4 3" />
                    <polygon points="28,5 38,10 28,15" fill="#FF6B2B" opacity="0.7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
