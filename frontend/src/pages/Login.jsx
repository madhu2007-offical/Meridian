import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      showToast('Welcome back!', 'success');
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <motion.div className="auth-card" animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Log in to manage your posts</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <Spinner size={20} /> : 'Log In'}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/forgot-password">Forgot password?</Link>
            <span className="sep">·</span>
            <Link to="/signup">Create account</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
