import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Check, AlertCircle } from 'lucide-react';
import './UpiInput.css';

function UpiInput() {
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [valid, setValid] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const navigate = useNavigate();

  const validate = (value) => {
    if (!value.trim()) {
      setValid(false);
      setError('');
      return false;
    }
    if (!value.includes('@')) {
      setValid(false);
      setError('UPI ID must contain @ symbol');
      return false;
    }
    const parts = value.split('@');
    if (parts[0].length === 0 || parts[1].length === 0) {
      setValid(false);
      setError('Enter a valid UPI ID');
      return false;
    }
    setValid(true);
    setError('');
    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUpiId(value);
    if (error) validate(value);
    else if (value.includes('@')) validate(value);
    else setValid(false);
  };

  const handleSubmit = () => {
    if (!validate(upiId)) {
      setShakeKey((k) => k + 1);
      return;
    }
    navigate(`/shop/${encodeURIComponent(upiId.trim().toLowerCase())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      className="upi-input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <motion.div
        className={`upi-input__group ${error ? 'upi-input__group--error' : ''} ${valid ? 'upi-input__group--valid' : ''}`}
        key={shakeKey}
        animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="upi-input__icon">
          <Smartphone size={20} />
        </div>
        <input
          type="text"
          className="upi-input__field"
          placeholder="e.g., shopname@paytm"
          value={upiId}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Enter UPI ID"
        />
        <div className="upi-input__status">
          {valid && <Check size={18} className="upi-input__check" />}
          {error && <AlertCircle size={18} className="upi-input__alert" />}
        </div>
        <button className="upi-input__btn" onClick={handleSubmit}>
          Find Reviews →
        </button>
      </motion.div>
      {error && (
        <motion.p
          className="upi-input__error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

export default UpiInput;
