import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      showToast('Check your email for reset instructions', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <motion.div className="auth-card" layout transition={{ duration: 0.35 }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1>Forgot Password</h1>
                <p className="auth-subtitle">Enter your email to receive a reset link</p>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <Spinner size={20} /> : 'Send Reset Link'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="confirm-box">
                <div className="confirm-icon">✉</div>
                <h2>Check Your Email</h2>
                <p>If an account with <strong>{email}</strong> exists, we sent a password reset link valid for 30 minutes.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="auth-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
