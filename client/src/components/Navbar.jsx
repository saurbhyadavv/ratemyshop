import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, User, Search, MapPin,
  ShoppingBasket, UtensilsCrossed, Scissors, Pill, Tv,
  Smartphone, Shirt, Leaf, Milk, CakeSlice, Wrench,
  BookOpen, Car, Flame, Store,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INDIAN_CITIES, SEO_CATEGORIES } from '../data/searchData';
import AuthModal from './AuthModal';
import './Navbar.css';

const NAV_CATEGORY_ICONS = {
  ShoppingBasket, UtensilsCrossed, Scissors, Pill, Tv,
  Smartphone, Shirt, Leaf, Milk, CakeSlice, Wrench,
  BookOpen, Car, Flame, Store,
};
function NavCatIcon({ name, size = 13 }) {
  const Icon = NAV_CATEGORY_ICONS[name] || Store;
  return <Icon size={size} />;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  const { user, displayName, avatarUrl, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Build autocomplete suggestions from query
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchSuggestions([]); return; }

    const citySugg = INDIAN_CITIES
      .filter((c) => c.name.toLowerCase().startsWith(q))
      .slice(0, 4)
      .map((c) => ({ type: 'city', label: c.name, sub: c.state, slug: c.slug }));

    const catSugg = SEO_CATEGORIES
      .filter((c) => c.label.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ type: 'category', label: c.label, sub: 'Category', slug: c.slug, lucideIcon: c.lucideIcon }));

    setSearchSuggestions([...citySugg, ...catSugg].slice(0, 6));
  }, [searchQuery]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSuggestionClick = (sug) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (sug.type === 'city') {
      navigate(`/shops/${sug.slug}`);
    } else {
      navigate(`/search?cat=${sug.slug}`);
    }
  };

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

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const navLinks = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Features', id: 'features' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'FAQ', path: '/faq' },
  ];

  const avatarInitial = displayName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <svg className="navbar__motif" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Search button */}
          <button
            className="navbar__search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search shops"
          >
            <Search size={16} />
            <span className="navbar__search-btn-text">Search shops…</span>
          </button>

          {/* Auth section */}
          <div className="navbar__auth">
            {user ? (
              <div className="navbar__user" onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}>
                {avatarUrl ? (
                  <img className="navbar__avatar" src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
                ) : (
                  <div className="navbar__avatar-initial">{avatarInitial}</div>
                )}
                <span className="navbar__display-name">{displayName}</span>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="navbar__user-menu"
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="user-menu__name">
                        <User size={14} />
                        {displayName}
                      </div>
                      <button className="user-menu__signout" onClick={handleSignOut}>
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button className="navbar__signin-btn" onClick={() => setAuthOpen(true)}>
                Sign in
              </button>
            )}
          </div>

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
              {!user && (
                <button
                  className="mobile-signin-btn"
                  onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                >
                  Sign in to post reviews
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="navbar__search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className="navbar__search-modal"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form className="navbar__search-form" onSubmit={handleSearch}>
                <Search size={18} className="navbar__search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search city, shop type, or name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar__search-input"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="navbar__search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Suggestions */}
              {searchSuggestions.length > 0 && (
                <ul className="navbar__search-sugg">
                  {searchSuggestions.map((s, i) => (
                    <li key={i} onMouseDown={() => handleSuggestionClick(s)}>
                      {s.type === 'city'
                        ? <MapPin size={14} className="sugg-icon sugg-icon--city" />
                        : <span className="sugg-icon sugg-icon--cat"><NavCatIcon name={s.lucideIcon} size={14} /></span>}
                      <span className="sugg-label">{s.label}</span>
                      <span className="sugg-sub">{s.sub}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Quick category links */}
              {!searchQuery && (
                <div className="navbar__search-quick">
                  <p className="navbar__search-quick-label">Browse categories</p>
                  <div className="navbar__search-cats">
                    {SEO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        className="navbar__search-cat-chip"
                        onMouseDown={() => { navigate(`/search?cat=${cat.slug}`); setSearchOpen(false); }}
                      >
                        <NavCatIcon name={cat.lucideIcon} size={13} /> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
