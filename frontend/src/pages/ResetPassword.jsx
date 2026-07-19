import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import api from '../api/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password && confirm && password === confirm;
  const passwordsMismatch = confirm && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: password, confirmPassword: confirm });
      showToast('Password reset successful!', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="auth-page">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="auth-subtitle">Enter your new password</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {passwordsMatch && <span className="match-indicator success">Passwords match</span>}
              {passwordsMismatch && <span className="match-indicator error">Passwords do not match</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !passwordsMatch}>
              {loading ? <Spinner size={20} /> : 'Reset Password'}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
