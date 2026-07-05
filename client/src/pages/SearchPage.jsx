import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin, Store,
  ArrowUpDown, ShoppingBasket, UtensilsCrossed, Scissors, Pill,
  Tv, Smartphone, Shirt, Leaf, Milk, CakeSlice, Wrench,
  BookOpen, Car, Flame,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  INDIAN_CITIES,
  SEO_CATEGORIES,
  ALL_SHOP_TYPES,
  getCityBySlug,
  getCategoryBySlug,
  getShopTypeLabel,
} from '../data/searchData';
import './SearchPage.css';

/* ── Lucide icon map for category slugs ──────────────────────────────── */
const CATEGORY_ICONS = {
  ShoppingBasket, UtensilsCrossed, Scissors, Pill, Tv,
  Smartphone, Shirt, Leaf, Milk, CakeSlice, Wrench,
  BookOpen, Car, Flame, Store,
};

function CategoryIcon({ name, size = 16 }) {
  const Icon = CATEGORY_ICONS[name] || Store;
  return <Icon size={size} />;
}

/* ── Constants ────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'rating_asc',  label: 'Lowest Rated' },
  { value: 'reviews_desc', label: 'Most Reviewed' },
  { value: 'name_asc',    label: 'Name (A–Z)' },
];

const PRICE_LABELS = { 1: '₹ Budget', 2: '₹₹ Moderate', 3: '₹₹₹ Pricey', 4: '₹₹₹₹ Premium' };

const MIN_RATING_OPTIONS = [
  { value: 0,   label: 'Any rating' },
  { value: 3,   label: '3+ stars' },
  { value: 4,   label: '4+ stars' },
  { value: 4.5, label: '4.5+ stars' },
];

const PAGE_SIZE = 12;

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* ── Decorative SVG underline (matches site-wide pattern) ────────────── */
function DecorUnderline() {
  return (
    <svg className="sp-decor-underline" width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
      <path d="M0 5 Q30 0 60 5 Q90 10 120 5" stroke="#FF6B2B" strokeWidth="2.5" fill="none" />
      <circle cx="0"   cy="5" r="2.5" fill="#F9A825" />
      <circle cx="60"  cy="5" r="2.5" fill="#C62828" />
      <circle cx="120" cy="5" r="2.5" fill="#00897B" />
    </svg>
  );
}

/* ── Madhubani corner motif ───────────────────────────────────────────── */
function MadhubaniCorner({ flip }) {
  return (
    <svg
      className={`sp-corner-motif${flip ? ' sp-corner-motif--flip' : ''}`}
      width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true"
    >
      <path d="M8 8 Q36 0 64 8 Q72 36 64 64" stroke="#FF6B2B" strokeWidth="1.5" fill="none" opacity="0.2" />
      <path d="M14 14 Q36 8 58 14 Q64 36 58 58" stroke="#F9A825" strokeWidth="1" fill="none" opacity="0.15" />
      <circle cx="8"  cy="8"  r="3.5" fill="#F9A825" opacity="0.35" />
      <circle cx="64" cy="64" r="3"   fill="#C62828"  opacity="0.35" />
      <ellipse cx="36" cy="12" rx="12" ry="4" fill="#FF6B2B" opacity="0.1" transform="rotate(-15 36 12)" />
      <ellipse cx="60" cy="36" rx="10" ry="3.5" fill="#00897B" opacity="0.1" transform="rotate(40 60 36)" />
      <circle cx="22" cy="22" r="2" fill="#1565C0" opacity="0.2" />
      <circle cx="50" cy="50" r="2" fill="#F9A825" opacity="0.2" />
    </svg>
  );
}

/* ── Inline stars ─────────────────────────────────────────────────────── */
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z';
function Stars({ rating, size = 14 }) {
  return (
    <div className="sp-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= Math.round(rating) ? '#F9A825' : '#E2E8F0'}
          stroke={n <= Math.round(rating) ? '#F57F17' : '#CBD5E1'}
          strokeWidth="1.5" strokeLinejoin="round">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function EmptyState({ city, category }) {
  return (
    <div className="sp-empty">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="36" fill="#FFF3E8" stroke="#FFE0CC" strokeWidth="2" />
        <path d="M40 24 L40 56 M24 40 L56 40" stroke="#FF6B2B" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        <circle cx="40" cy="40" r="12" stroke="#FF6B2B" strokeWidth="1.5" fill="none" opacity="0.35" />
        <circle cx="40" cy="40" r="4"  fill="#FF6B2B" opacity="0.25" />
      </svg>
      <p className="sp-empty__title">No shops found</p>
      <p className="sp-empty__sub">
        {city && category
          ? `No ${category.label} in ${city.name} match your filters yet.`
          : 'Try adjusting your search or filters.'}
      </p>
      <p className="sp-empty__hint">
        Know a shop? Help your community by reviewing it via its UPI QR code.
      </p>
    </div>
  );
}

/* ── Shop card ────────────────────────────────────────────────────────── */
function ShopCard({ shop }) {
  const typeLabel = getShopTypeLabel(shop.shop_type || shop.category);
  const rating     = shop.avg_rating ? Number(shop.avg_rating).toFixed(1) : null;
  const reviewCount = shop.review_count || 0;

  return (
    <Link to={`/shop/${shop.hash}`} className="sp-card" aria-label={`View ${shop.display_name || shop.name}`}>
      <div className="sp-card__icon-wrap">
        <Store size={26} strokeWidth={1.5} />
      </div>
      <div className="sp-card__body">
        <h3 className="sp-card__name">{shop.display_name || shop.name || 'Unnamed Shop'}</h3>
        <span className="sp-card__type">{typeLabel}</span>
        {shop.location && (
          <p className="sp-card__location"><MapPin size={11} />{shop.location}</p>
        )}
      </div>
      <div className="sp-card__meta">
        {rating ? (
          <>
            <Stars rating={Number(rating)} />
            <span className="sp-card__rating">{rating}</span>
            <span className="sp-card__count">({reviewCount})</span>
          </>
        ) : (
          <span className="sp-card__no-rating">No reviews yet</span>
        )}
        {shop.price_range > 0 && (
          <span className="sp-card__price">{PRICE_LABELS[shop.price_range]}</span>
        )}
      </div>
    </Link>
  );
}

/* ── Filter panel ─────────────────────────────────────────────────────── */
function FilterPanel({ filters, onChange, onReset }) {
  const hasActive = filters.shopTypes.length > 0 || filters.minRating > 0 || filters.priceRange > 0;

  return (
    <aside className="sp-filters">
      <div className="sp-filters__header">
        <span className="sp-filters__title"><SlidersHorizontal size={14} /> Filters</span>
        {hasActive && (
          <button className="sp-filters__reset" onClick={onReset}><X size={12} /> Reset</button>
        )}
      </div>

      <div className="sp-filters__group">
        <p className="sp-filters__label">Shop Type</p>
        <div className="sp-filters__types">
          {ALL_SHOP_TYPES.map((t) => (
            <label key={t.value} className="sp-filters__check">
              <input
                type="checkbox"
                checked={filters.shopTypes.includes(t.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filters.shopTypes, t.value]
                    : filters.shopTypes.filter((v) => v !== t.value);
                  onChange({ ...filters, shopTypes: next });
                }}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="sp-filters__group">
        <p className="sp-filters__label">Minimum Rating</p>
        {MIN_RATING_OPTIONS.map((opt) => (
          <label key={opt.value} className="sp-filters__radio">
            <input type="radio" name="minRating"
              checked={filters.minRating === opt.value}
              onChange={() => onChange({ ...filters, minRating: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="sp-filters__group">
        <p className="sp-filters__label">Price Range</p>
        <label className="sp-filters__radio">
          <input type="radio" name="price" checked={filters.priceRange === 0}
            onChange={() => onChange({ ...filters, priceRange: 0 })} />
          Any
        </label>
        {[1, 2, 3, 4].map((n) => (
          <label key={n} className="sp-filters__radio">
            <input type="radio" name="price" checked={filters.priceRange === n}
              onChange={() => onChange({ ...filters, priceRange: n })} />
            {PRICE_LABELS[n]}
          </label>
        ))}
      </div>
    </aside>
  );
}


/* ── Main Component ───────────────────────────────────────────────────── */
export default function SearchPage() {
  const { city: citySlug, category: categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const city     = citySlug     ? getCityBySlug(citySlug)         : null;
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;

  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [cityInput, setCityInput]   = useState(city?.name || searchParams.get('city') || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySugg, setShowCitySugg]       = useState(false);

  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage]             = useState(0);

  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating_desc');
  const [filters, setFilters] = useState({
    shopTypes:  category ? category.shopTypes : [],
    minRating:  Number(searchParams.get('rating') || 0),
    priceRange: Number(searchParams.get('price')  || 0),
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ── City autocomplete ──────────────────────────────────────────────── */
  const handleCityInput = (e) => {
    const val = e.target.value;
    setCityInput(val);
    if (val.length >= 2) {
      const q = val.toLowerCase();
      setCitySuggestions(INDIAN_CITIES.filter((c) => c.name.toLowerCase().startsWith(q)).slice(0, 6));
      setShowCitySugg(true);
    } else {
      setCitySuggestions([]);
      setShowCitySugg(false);
    }
  };

  const selectCity = (c) => {
    setCityInput(c.name);
    setCitySuggestions([]);
    setShowCitySugg(false);
    if (categorySlug) navigate(`/shops/${c.slug}/${categorySlug}`);
    else navigate(`/shops/${c.slug}`);
  };

  /* ── Fetch shops ────────────────────────────────────────────────────── */
  const fetchShops = useCallback(async (resetPage = true) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;
    if (resetPage) setPage(0);

    try {
      let q = supabase
        .from('shops')
        .select(
          'upi_id, name, display_name, shop_type, category, hash, avg_rating, review_count, price_range, location',
          { count: 'exact' }
        );

      if (city) {
        q = q.ilike('location', `%${city.name}%`);
      } else if (cityInput) {
        const matched = INDIAN_CITIES.find((c) => c.name.toLowerCase() === cityInput.toLowerCase());
        if (matched) q = q.ilike('location', `%${matched.name}%`);
      }

      const activeTypes = filters.shopTypes.length > 0
        ? filters.shopTypes
        : (category?.shopTypes || []);
      if (activeTypes.length > 0) q = q.in('shop_type', activeTypes);

      if (query.trim()) q = q.ilike('display_name', `%${query.trim()}%`);
      if (filters.minRating > 0)  q = q.gte('avg_rating', filters.minRating);
      if (filters.priceRange > 0) q = q.eq('price_range', filters.priceRange);

      switch (sortBy) {
        case 'rating_asc':   q = q.order('avg_rating',   { ascending: true,  nullsFirst: false }); break;
        case 'reviews_desc': q = q.order('review_count', { ascending: false, nullsFirst: false }); break;
        case 'name_asc':     q = q.order('display_name', { ascending: true  }); break;
        default:             q = q.order('avg_rating',   { ascending: false, nullsFirst: false });
      }

      q = q.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await q;
      if (error) throw error;

      setShops(resetPage ? (data || []) : (prev) => [...prev, ...(data || [])]);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [city, cityInput, citySlug, category, filters, query, sortBy, page]);

  useEffect(() => {
    fetchShops(true);
    const params = {};
    if (query)               params.q      = query;
    if (sortBy !== 'rating_desc') params.sort = sortBy;
    if (filters.minRating > 0)    params.rating = filters.minRating;
    if (filters.priceRange > 0)   params.price  = filters.priceRange;
    setSearchParams(params, { replace: true });
  }, [city, category, query, sortBy, filters]);

  useEffect(() => {
    let title = 'Search Shops – RateMyShop';
    if (city && category) title = `${category.label} in ${city.name} – RateMyShop`;
    else if (city)         title = `Shops in ${city.name} – RateMyShop`;
    else if (category)     title = `${category.label} – RateMyShop`;
    document.title = title;
  }, [city, category]);

  const handleSearch   = (e) => { e.preventDefault(); fetchShops(true); };
  const handleLoadMore = () => { const next = page + 1; setPage(next); fetchShops(false); };
  const handleResetFilters = () => setFilters({ shopTypes: category?.shopTypes || [], minRating: 0, priceRange: 0 });
  const hasMore = shops.length < totalCount;

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <motion.div className="sp-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* ── Hero ── */}
      <div className="sp-hero">
        <MadhubaniCorner />
        <MadhubaniCorner flip />

        <div className="sp-hero__inner">
          {(city || category) && (
            <nav className="sp-breadcrumb" aria-label="breadcrumb">
              <Link to="/search">Search</Link>
              {city && <><span>/</span><Link to={`/shops/${city.slug}`}>{city.name}</Link></>}
              {category && <><span>/</span><span>{category.label}</span></>}
            </nav>
          )}

          <h1 className="sp-hero__title">
            {city && category
              ? `${category.label} in ${city.name}`
              : city
              ? `Shops in ${city.name}`
              : category
              ? category.label
              : 'Find Local Shops'}
          </h1>
          <DecorUnderline />

          {city && category && (
            <p className="sp-hero__sub">
              Discover and rate trusted {category.label.toLowerCase()} in {city.name}, {city.state}.
              Real reviews from your community.
            </p>
          )}

          {/* Search bar */}
          <form className="sp-search-bar" onSubmit={handleSearch}>
            <div className="sp-search-bar__field sp-search-bar__city">
              <MapPin size={15} className="sp-search-bar__icon" />
              <input
                type="text"
                placeholder="City (e.g. Jaipur)"
                value={cityInput}
                onChange={handleCityInput}
                onFocus={() => cityInput.length >= 2 && setShowCitySugg(true)}
                onBlur={() => setTimeout(() => setShowCitySugg(false), 150)}
                className="sp-search-bar__input"
                aria-label="City"
                autoComplete="off"
              />
              <AnimatePresence>
                {showCitySugg && citySuggestions.length > 0 && (
                  <motion.ul className="sp-city-sug"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                  >
                    {citySuggestions.map((c) => (
                      <li key={c.slug} onMouseDown={() => selectCity(c)}>
                        <MapPin size={12} />
                        {c.name}
                        <span className="sp-city-sug__state">{c.state}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div className="sp-search-bar__field sp-search-bar__query">
              <Search size={15} className="sp-search-bar__icon" />
              <input
                type="text"
                placeholder="Shop name or type…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="sp-search-bar__input"
                aria-label="Search query"
              />
            </div>

            <button type="submit" className="sp-search-bar__btn">
              <Search size={15} /> Search
            </button>
          </form>

          {/* Category chips — icon + label, no emojis */}
          <div className="sp-cat-links">
            {SEO_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={city ? `/shops/${city.slug}/${cat.slug}` : `/search?cat=${cat.slug}`}
                className={`sp-cat-chip ${category?.slug === cat.slug ? 'sp-cat-chip--active' : ''}`}
              >
                <CategoryIcon name={cat.lucideIcon} size={14} />
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="sp-body">
        <button className="sp-filter-toggle" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
          <SlidersHorizontal size={14} />
          Filters
          {(filters.shopTypes.length > 0 || filters.minRating > 0 || filters.priceRange > 0) && (
            <span className="sp-filter-toggle__badge" />
          )}
          <ChevronDown size={13} className={filtersOpen ? 'rotated' : ''} />
        </button>

        <div className="sp-layout">
          <div className={`sp-sidebar ${filtersOpen ? 'sp-sidebar--open' : ''}`}>
            <FilterPanel
              filters={filters}
              onChange={(f) => { setFilters(f); setFiltersOpen(false); }}
              onReset={handleResetFilters}
            />
          </div>

          <div className="sp-results">
            <div className="sp-toolbar">
              <p className="sp-toolbar__count">
                {loading ? 'Searching…' : `${totalCount} shop${totalCount !== 1 ? 's' : ''} found`}
              </p>
              <div className="sp-toolbar__sort">
                <ArrowUpDown size={13} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {!loading && shops.length === 0 ? (
              <EmptyState city={city} category={category} />
            ) : (
              <div className="sp-grid">
                <AnimatePresence>
                  {shops.map((shop, i) => (
                    <motion.div key={shop.upi_id || i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 5) * 0.05 }}
                    >
                      <ShopCard shop={shop} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {loading && (
              <div className="sp-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="sp-card sp-card--skeleton" />
                ))}
              </div>
            )}

            {!loading && hasMore && (
              <div className="sp-load-more">
                <button className="sp-load-more__btn" onClick={handleLoadMore}>
                  Load more shops
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Browse grid — shown on bare /search with no active query */}
        {!city && !category && !query && (
          <section className="sp-browse">
            <div className="sp-browse__header">
              <h2 className="sp-browse__title">Browse by City</h2>
              <DecorUnderline />
            </div>
            <div className="sp-browse__grid">
              {INDIAN_CITIES.slice(0, 24).map((c) => (
                <div key={c.slug} className="sp-browse__city-block">
                  <h3 className="sp-browse__city-name">
                    <MapPin size={12} /> {c.name}
                    <span className="sp-browse__city-state">{c.state}</span>
                  </h3>
                  <ul className="sp-browse__cat-list">
                    {SEO_CATEGORIES.map((cat) => (
                      <li key={cat.slug}>
                        <Link to={`/shops/${c.slug}/${cat.slug}`}>
                          <CategoryIcon name={cat.lucideIcon} size={12} />
                          {cat.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
