import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e, path, id) => {
    e.preventDefault();
    setMobileOpen(false);
    
    if (id) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  const navLinks = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'FAQ', path: '/faq' },
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          {/* Madhubani-inspired lotus motif */}
          <svg
            className="navbar__motif"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="14" cy="14" rx="5" ry="9" fill="#FF6B2B" opacity="0.85" />
            <ellipse cx="14" cy="14" rx="5" ry="9" fill="#F9A825" opacity="0.5" transform="rotate(60 14 14)" />
            <ellipse cx="14" cy="14" rx="5" ry="9" fill="#C62828" opacity="0.4" transform="rotate(120 14 14)" />
            <circle cx="14" cy="14" r="3" fill="#F9A825" />
            <circle cx="14" cy="14" r="1.2" fill="#C62828" />
          </svg>
          <span className="navbar__logo-text">RateMyShop</span>
        </Link>

        {/* Desktop nav */}
        <ul className="navbar__links">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a href={link.path || `#${link.id}`} onClick={(e) => handleNavClick(e, link.path, link.id)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path || `#${link.id}`} onClick={(e) => handleNavClick(e, link.path, link.id)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
