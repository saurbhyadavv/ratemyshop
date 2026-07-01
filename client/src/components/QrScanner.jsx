import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import './QrScanner.css';

function extractUpiId(text) {
  try {
    // UPI QR codes often contain URLs like upi://pay?pa=xxx@upi&pn=...
    // Try to extract 'pa' parameter
    const url = new URL(text);
    const pa = url.searchParams.get('pa');
    if (pa) return pa;
  } catch {
    // Not a valid URL — try regex on raw text
  }

  // Fallback: search for pa= in the raw string
  const match = text.match(/[?&]pa=([^&]+)/i);
  if (match) return decodeURIComponent(match[1]);

  // Last resort: return raw text (it might already be a UPI ID)
  return text.trim();
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export default function QrScanner({ isOpen, onClose, onScan }) {
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // Scanner may not be running — safe to ignore
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Ignore clear errors
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setError(null);
      hasScannedRef.current = false;
      return;
    }

    // Small delay to ensure DOM is ready
    const startTimeout = setTimeout(() => {
      const container = document.getElementById('qr-reader');
      if (!container) return;

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            // Prevent multiple scans
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            const upiId = extractUpiId(decodedText);
            stopScanner();

            if (onScan) onScan(upiId);
          },
          () => {
            // QR scan error (no code found in frame) — ignore silently
          }
        )
        .catch((err) => {
          const msg = String(err?.message || err || '');

          if (
            msg.includes('NotAllowedError') ||
            msg.includes('Permission')
          ) {
            setError(
              'Camera permission denied. Please allow camera access in your browser settings and try again.'
            );
          } else if (
            msg.includes('NotFoundError') ||
            msg.includes('no cameras')
          ) {
            setError(
              'No camera found on this device. Please connect a camera or try on a mobile device.'
            );
          } else {
            setError(
              'Unable to start the camera. Please make sure no other app is using it and try again.'
            );
          }
        });
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      stopScanner();
    };
  }, [isOpen, onScan, stopScanner]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="qrOverlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="qrModal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="qrModalHeader">
              <span className="qrTitle">Scan UPI QR Code</span>
              <button
                className="qrCloseBtn"
                onClick={onClose}
                type="button"
                aria-label="Close scanner"
              >
                <X size={18} />
              </button>
            </div>

            <div className="qrScannerBody">
              {error ? (
                <div className="qrError">
                  <div className="qrErrorIcon">!</div>
                  <span className="qrErrorTitle">Camera Unavailable</span>
                  <p className="qrErrorMsg">{error}</p>
                </div>
              ) : (
                <>
                  <div className="qrScannerFrame">
                    <div
                      id="qr-reader"
                      ref={containerRef}
                      className="qrReaderContainer"
                    />
                  </div>
                  <p className="qrHint">
                    Point your camera at a UPI QR code to scan the shop's payment ID
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
