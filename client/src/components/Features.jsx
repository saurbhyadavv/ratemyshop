import { motion } from 'framer-motion';
import { Zap, ShieldCheck, MapPin, IndianRupee } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: Zap,
    title: 'No App Needed',
    desc: 'Works right in your browser. No downloads, no sign-ups, no hassle.',
    color: '#FF6B2B',
  },
  {
    icon: ShieldCheck,
    title: 'Community Driven',
    desc: 'Real reviews from real customers. Transparent and honest feedback.',
    color: '#00897B',
  },
  {
    icon: MapPin,
    title: 'Location Optional',
    desc: 'Add your location to help nearby shoppers, or keep it private.',
    color: '#1565C0',
  },
  {
    icon: IndianRupee,
    title: 'UPI Powered',
    desc: "Every shop with a UPI ID can be reviewed. That's millions of shops across India.",
    color: '#C62828',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* Decorative underline */
const DecorUnderline = () => (
  <svg
    className="features__underline"
    width="160"
    height="10"
    viewBox="0 0 160 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M0 5 Q40 0 80 5 Q120 10 160 5" stroke="#FF6B2B" strokeWidth="2.5" fill="none" />
    <circle cx="0" cy="5" r="2.5" fill="#F9A825" />
    <circle cx="80" cy="5" r="2.5" fill="#C62828" />
    <circle cx="160" cy="5" r="2.5" fill="#00897B" />
  </svg>
);

function Features() {
  return (
    <section className="features" id="features">
      <div className="features__inner">
        <motion.div
          className="features__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="features__title">Why RateMyShop?</h2>
          <DecorUnderline />
        </motion.div>

        <div className="features__grid">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="features__card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
              style={{ '--accent': feat.color }}
            >
              <div className="features__card-icon" style={{ background: `${feat.color}12` }}>
                <feat.icon size={22} style={{ color: feat.color }} />
              </div>
              <div className="features__card-body">
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
