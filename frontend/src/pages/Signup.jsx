import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import api from '../api/axios';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      showToast('Account created! Check your email for OTP.', 'success');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <motion.div className="auth-card" layout>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Sign up to compose posts across platforms</p>
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <motion.div variants={itemVariants} className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </motion.div>
            <motion.div variants={itemVariants} className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </motion.div>
            <motion.div variants={itemVariants} className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </motion.div>
            <motion.div variants={itemVariants} className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </motion.div>
            <motion.button variants={itemVariants} type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <Spinner size={20} /> : 'Sign Up'}
            </motion.button>
          </motion.form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Signup;
