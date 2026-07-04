import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

/* Google G SVG — precise brand mark */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose }) {
  const [emailMode, setEmailMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();

  const reset = () => { setError(''); setSuccess(''); };

  const handleGoogleSignIn = async () => {
    reset();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Try again.');
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    reset();
    if (!email || !password) return setError('Enter both email and password.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      if (emailMode === 'signup') {
        await signUpWithEmail(email, password);
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setEmailMode('signin');
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button className="auth-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>

            {/* Header */}
            <div className="auth-header">
              <div className="auth-madhubani-bar" aria-hidden="true" />
              <h2>Sign in to RateMyShop</h2>
              <p>Post reviews, track shops, and help your community.</p>
            </div>

            {/* Google — always prominent at top */}
            <div className="auth-google-section">
              <button
                className="btn-google"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider__line" />
              <span className="auth-divider__text">or continue with</span>
              <span className="auth-divider__line" />
            </div>

            <div className="auth-body">
              <div className="auth-mode-toggle" role="group">
                <button
                  className={emailMode === 'signin' ? 'active' : ''}
                  onClick={() => { setEmailMode('signin'); reset(); }}
                >Sign In</button>
                <button
                  className={emailMode === 'signup' ? 'active' : ''}
                  onClick={() => { setEmailMode('signup'); reset(); }}
                >Create Account</button>
              </div>

              <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="auth-email">Email address</label>
                  <div className="field-input-wrap">
                    <Mail size={15} className="field-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="auth-password">Password</label>
                  <div className="field-input-wrap">
                    <button
                      type="button"
                      className="field-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                      required
                    />
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {success && (
                  <p className="auth-success">
                    <CheckCircle size={14} /> {success}
                  </p>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Please wait…' : emailMode === 'signup' ? 'Create Account' : 'Sign In'}
                  {!loading && <ArrowRight size={15} />}
                </button>
              </form>
            </div>

            <p className="auth-terms">
              By continuing you agree to our terms of service and privacy policy.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
