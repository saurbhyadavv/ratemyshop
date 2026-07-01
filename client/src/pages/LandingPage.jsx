import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';

function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <HowItWorks />
      <Features />
    </motion.div>
  );
}

export default LandingPage;
