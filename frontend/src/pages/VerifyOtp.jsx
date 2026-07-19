import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes (600s)
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (value, idx) => {
    if (value && isNaN(value)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = value.slice(-1); // Only keep last typed digit
    setOtpDigits(newDigits);

    // Auto-advance to next box if value entered
    if (value && idx < 5) {
      const nextInput = document.getElementById(`otp-digit-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[idx] && idx > 0) {
        const newDigits = [...otpDigits];
        newDigits[idx - 1] = '';
        setOtpDigits(newDigits);
        const prevInput = document.getElementById(`otp-digit-${idx - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const newDigits = pasteData.split('');
    setOtpDigits(newDigits);
    document.getElementById('otp-digit-5')?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpCode });
      login(res.data.token, res.data.user);
      setVerified(true);
      setTimeout(() => {
        showToast('Email verified!', 'success');
        navigate('/feed');
      }, 2000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/auth/resend-otp', { email });
      showToast('OTP resent to your email', 'success');
      setCountdown(600); // Reset countdown to 10 minutes
      setOtpDigits(['', '', '', '', '', '']);
      document.getElementById('otp-digit-0')?.focus();
    } catch (err) {
      showToast(err.response?.data?.message || 'Resend failed', 'error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCountLow = countdown < 60;

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-card">
          <AnimatePresence mode="wait">
            {!verified ? (
              <motion.div
                key="verify-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h1>Verify Email</h1>
                <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>
                <form onSubmit={handleVerify} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>OTP Code</label>
                    <div className="otp-digits-container" onPaste={handlePaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-digit-${idx}`}
                          type="text"
                          maxLength={1}
                          required
                          value={digit}
                          onChange={(e) => handleChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className="otp-digit-box"
                          autoFocus={idx === 0}
                          autoComplete="off"
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <Spinner size={20} /> : 'Verify'}
                  </button>
                </form>

                <div className="resend-section">
                  {countdown > 0 ? (
                    <span className={`countdown ${isCountLow ? 'countdown-low' : ''}`}>
                      Code expires in {formatTime(countdown)}
                    </span>
                  ) : (
                    <motion.button
                      className="btn btn-ghost resend-btn-pulse"
                      onClick={handleResend}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Resend Code
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-box"
                className="confirm-box"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="44"
                      stroke="var(--success)"
                      strokeWidth="6"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M30 52 L45 67 L70 37"
                      stroke="var(--success)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                </div>
                <h2>Success!</h2>
                <p>Your email has been successfully verified.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="auth-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyOtp;
