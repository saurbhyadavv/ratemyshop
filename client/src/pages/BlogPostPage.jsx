import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import './BlogPostPage.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function BlogPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === parseInt(id));

  useEffect(() => {
    if (!post) {
      navigate('/blog', { replace: true });
      return;
    }
    
    document.title = `${post.title} — RateMyShop Blog`;

    const blogJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": new Date(post.date).toISOString(),
      "author": { "@type": "Organization", "name": "RateMyShop" },
      "description": post.excerpt
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(blogJsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [post, navigate]);

  if (!post) return null;

  return (
    <motion.main
      className="blog-post-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="blog-post-container">
        <Link to="/blog" className="back-link">
          <ArrowLeft size={20} /> Back to Blog
        </Link>
        
        <article className="blog-post-article">
          <header className="blog-post-header">
            <span className={`blog-category blog-category--${post.category.toLowerCase()}`}>
              {post.category}
            </span>
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-meta">
              <span className="blog-date">{post.date}</span>
              <span className="blog-dot">•</span>
              <span className="blog-time"><Clock size={16} /> {post.readTime}</span>
            </div>
          </header>
          
          <div 
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </motion.main>
  );
}
