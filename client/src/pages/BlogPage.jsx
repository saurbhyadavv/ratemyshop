import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import './BlogPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function BlogPage() {
  // Generate JSON-LD
  useEffect(() => {
    document.title = 'Blog — RateMyShop | Insights on Local Commerce';
    
    const blogJsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "RateMyShop Blog",
      "url": "https://ratemyshop.in/blog",
      "description": "Insights, guides, and trends on local commerce and UPI in India.",
      "blogPost": blogPosts.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "datePublished": new Date(post.date).toISOString(),
        "author": { "@type": "Organization", "name": "RateMyShop" },
        "description": post.excerpt
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(blogJsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <motion.main
      className="blog-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero__content">
          <span className="blog-hero__badge">Updates & Insights</span>
          <h1 className="blog-hero__title">
            The <span>RateMyShop</span> Blog
          </h1>
          <p className="blog-hero__subtitle">
            Discover the latest trends in local Indian commerce, tips for better reviews, and how UPI is changing the way we shop.
          </p>
        </div>
        <div className="blog-hero__border" aria-hidden="true" />
      </section>

      {/* Blog Grid */}
      <section className="blog-grid-section">
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <motion.div 
              key={post.id} 
              className="blog-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="blog-card__header">
                <span className={`blog-category blog-category--${post.category.toLowerCase()}`}>
                  {post.category}
                </span>
                <div className="blog-meta">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-dot">•</span>
                  <span className="blog-time"><Clock size={14} /> {post.readTime}</span>
                </div>
              </div>
              
              <h2 className="blog-card__title">{post.title}</h2>
              <p className="blog-card__excerpt">{post.excerpt}</p>
              
              <Link 
                to={`/blog/${post.id}`}
                className="blog-card__read-btn"
              >
                Read Article <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
