import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import './OwnerQrModal.css';

const INK = '#17152F';
const RED = '#B8242F';
const SAFFRON = '#E85D25';
const GOLD = '#D79A23';
const TEAL = '#0B8176';
const BLUE = '#155E9F';
const PAPER = '#FFF9EE';
const PAPER_DARK = '#F8E7C8';

function getDisplayText(value, fallback) {
  try {
    return decodeURIComponent(value || fallback);
  } catch {
    return value || fallback;
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawTextFit(ctx, text, x, y, maxWidth, initialSize, weight = 800, family = 'Outfit, Arial, sans-serif') {
  let size = initialSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 1;
  } while (ctx.measureText(text).width > maxWidth && size > 18);
  ctx.fillText(text, x, y);
}

function drawLeaf(ctx, x, y, size, color, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.7, -size * 0.35, size * 0.55, size * 0.65, 0, size);
  ctx.bezierCurveTo(-size * 0.55, size * 0.65, -size * 0.7, -size * 0.35, 0, -size);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.72);
  ctx.lineTo(0, size * 0.72);
  ctx.stroke();
  ctx.restore();
}

function drawFish(ctx, x, y, width, color, flip = false) {
  const direction = flip ? -1 : 1;
  const height = width * 0.34;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.34, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width * 0.31, 0);
  ctx.lineTo(-width * 0.55, -height * 0.82);
  ctx.lineTo(-width * 0.55, height * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.arc(width * 0.18, -height * 0.18, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(width * 0.2, -height * 0.18, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-width * 0.05, -height * 0.8);
  ctx.quadraticCurveTo(width * 0.08, 0, -width * 0.05, height * 0.8);
  ctx.stroke();
  ctx.restore();
}

function drawLotus(ctx, x, y, size) {
  const colors = [RED, SAFFRON, GOLD];
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  colors.forEach((color, index) => {
    const scale = 1 - index * 0.16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size * scale);
    ctx.bezierCurveTo(size * 0.7 * scale, -size * 0.38 * scale, size * 0.54 * scale, size * 0.62 * scale, 0, size * 0.72 * scale);
    ctx.bezierCurveTo(-size * 0.54 * scale, size * 0.62 * scale, -size * 0.7 * scale, -size * 0.38 * scale, 0, -size * scale);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(Math.PI / 4);
  });
  ctx.restore();
}

function drawBorderPattern(ctx, width, height) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, width - 68, height - 68);

  ctx.strokeStyle = SAFFRON;
  ctx.lineWidth = 8;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, width - 128, height - 128);
  ctx.strokeRect(86, 86, width - 172, height - 172);

  const dots = [
    { color: RED, radius: 5 },
    { color: GOLD, radius: 3 },
    { color: TEAL, radius: 4 },
    { color: BLUE, radius: 3 },
  ];

  for (let x = 106; x <= width - 106; x += 34) {
    dots.forEach(({ color, radius }, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + index * 2, 74, radius, 0, Math.PI * 2);
      ctx.arc(x + index * 2, height - 74, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  for (let y = 112; y <= height - 112; y += 40) {
    drawLeaf(ctx, 74, y, 12, y % 80 === 0 ? TEAL : GOLD, Math.PI / 2);
    drawLeaf(ctx, width - 74, y, 12, y % 80 === 0 ? RED : SAFFRON, -Math.PI / 2);
  }

  drawLotus(ctx, 104, 112, 21);
  drawLotus(ctx, width - 104, 112, 21);
  drawFish(ctx, 108, height - 112, 58, BLUE);
  drawFish(ctx, width - 108, height - 112, 58, TEAL, true);
}

export default function OwnerQrModal({ isOpen, onClose, upiId, shopName }) {
  const canvasRef = useRef(null);
  const downloadCanvasRef = useRef(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const decodedUpi = getDisplayText(upiId, '');
  const cleanShopName = getDisplayText(shopName, 'Our Shop');
  const upiUri = `upi://pay?pa=${decodedUpi}&pn=${encodeURIComponent(cleanShopName)}`;

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    setQrLoaded(false);
    QRCode.toCanvas(
      canvasRef.current,
      upiUri,
      {
        width: 236,
        margin: 1,
        errorCorrectionLevel: 'H',
        color: {
          dark: INK,
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) console.error('Error generating QR code', error);
        else setQrLoaded(true);
      }
    );
  }, [isOpen, upiUri]);

  const handleDownload = () => {
    if (!downloadCanvasRef.current) return;
    setDownloading(true);

    const canvas = downloadCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 1500;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(215, 154, 35, 0.12)';
    for (let x = 118; x < width; x += 92) {
      for (let y = 122; y < height; y += 92) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawBorderPattern(ctx, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    drawTextFit(ctx, 'RateMyShop.in', width / 2, 214, 720, 78);

    ctx.strokeStyle = RED;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 210, 250);
    ctx.quadraticCurveTo(width / 2, 280, width / 2 + 210, 250);
    ctx.stroke();
    drawLeaf(ctx, width / 2 - 245, 250, 17, TEAL, -Math.PI / 2);
    drawLeaf(ctx, width / 2 + 245, 250, 17, TEAL, Math.PI / 2);

    ctx.fillStyle = RED;
    ctx.font = '800 42px Outfit, Arial, sans-serif';
    ctx.fillText('SCAN TO PAY OR REVIEW', width / 2, 338);

    ctx.fillStyle = '#4B4A5F';
    ctx.font = '600 29px Outfit, Arial, sans-serif';
    ctx.fillText('Payments, trust, and local reviews in one sign', width / 2, 386);

    QRCode.toDataURL(
      upiUri,
      {
        width: 560,
        margin: 1,
        errorCorrectionLevel: 'H',
        color: {
          dark: INK,
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (err) {
          console.error(err);
          setDownloading(false);
          return;
        }

        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.shadowColor = 'rgba(23, 21, 47, 0.16)';
          ctx.shadowBlur = 28;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = '#FFFFFF';
          drawRoundedRect(ctx, 286, 438, 628, 628, 28);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = INK;
          ctx.lineWidth = 4;
          drawRoundedRect(ctx, 306, 458, 588, 588, 18);
          ctx.stroke();

          ctx.strokeStyle = SAFFRON;
          ctx.lineWidth = 8;
          drawRoundedRect(ctx, 326, 478, 548, 548, 10);
          ctx.stroke();

          ctx.drawImage(img, 350, 502, 500, 500);

          ctx.fillStyle = INK;
          drawTextFit(ctx, cleanShopName, width / 2, 1124, 840, 58);

          ctx.fillStyle = '#4B4A5F';
          drawTextFit(ctx, decodedUpi, width / 2, 1178, 780, 34, 700, 'Consolas, Menlo, monospace');

          ctx.fillStyle = PAPER_DARK;
          drawRoundedRect(ctx, 178, 1234, 844, 118, 24);
          ctx.fill();
          ctx.strokeStyle = 'rgba(23, 21, 47, 0.18)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = BLUE;
          ctx.font = '800 31px Outfit, Arial, sans-serif';
          ctx.fillText('Pay with GPay, PhonePe, Paytm, BHIM', width / 2, 1284);

          ctx.fillStyle = TEAL;
          ctx.font = '800 31px Outfit, Arial, sans-serif';
          ctx.fillText('Review with the RateMyShop scanner', width / 2, 1328);

          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `ratemyshop-${decodedUpi.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          link.href = dataUrl;
          link.click();
          setDownloading(false);
        };
        img.src = url;
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="owner-qr-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="owner-qr-modal"
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="owner-qr-close" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>

            <div className="owner-qr-header">
              <span className="owner-qr-eyebrow">
                <Sparkles size={15} />
                Printable shop sign
              </span>
              <h2>Owner QR Kit</h2>
              <p>A professional Madhubani-inspired sign for payments and local reviews.</p>
            </div>

            <div className="owner-qr-preview-container">
              <div className="designer-qr-card">
                <div className="madhubani-frame">
                  <span className="folk-corner folk-corner--tl" />
                  <span className="folk-corner folk-corner--tr" />
                  <span className="folk-corner folk-corner--bl" />
                  <span className="folk-corner folk-corner--br" />

                  <div className="card-top-header">
                    <h3>RateMyShop.in</h3>
                    <div className="divider-motif" />
                    <span className="card-motto">SCAN TO PAY OR REVIEW</span>
                  </div>

                  <div className="qr-container">
                    <canvas ref={canvasRef} />
                    {!qrLoaded && <div className="qr-skeleton" />}
                  </div>

                  <div className="card-info">
                    <h4 className="card-shop-name">{cleanShopName}</h4>
                    <span className="card-upi-id">{decodedUpi}</span>
                  </div>

                  <div className="card-instructions">
                    <div className="instruction-row">
                      <CreditCard size={16} className="text-blue" />
                      <span>Pay with any UPI app</span>
                    </div>
                    <div className="instruction-row">
                      <ShieldCheck size={16} className="text-teal" />
                      <span>Review with RateMyShop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <canvas ref={downloadCanvasRef} style={{ display: 'none' }} />

            <div className="owner-qr-actions">
              <button
                className="btn-download"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={18} />
                {downloading ? 'Preparing sign...' : 'Download PNG Sign'}
              </button>
              <button className="btn-close" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
