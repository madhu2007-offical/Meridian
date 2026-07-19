import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import api from '../api/axios';

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/admin/posts'),
        api.get('/admin/users'),
      ]);
      setPosts(postsRes.data.posts);
      setUsers(usersRes.data.users);
    } catch {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      showToast('Post deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleEdit = (post) => {
    navigate(`/composer?edit=${post._id}`);
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data.user : u)));
      showToast(`Role updated to ${newRole}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Role update failed', 'error');
    }
  };

  const handleToggleClick = (user) => {
    setConfirmModal({ show: true, user });
  };

  if (loading) {
    return (
      <div className="center-page">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page admin-page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="admin-tabs">
          <button className={`tab-btn ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
            All Posts ({posts.length})
          </button>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Users ({users.length})
          </button>
        </div>

        {tab === 'posts' && (
          <div className="post-list">
            <AnimatePresence>
              {posts.map((post, i) => (
                <PostCard
                  key={post._id}
                  post={post}
                  index={i}
                  showAuthor
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>
            {posts.length === 0 && <p className="empty-text">No posts found.</p>}
          </div>
        )}

        {tab === 'users' && (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Role Switch</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-customer'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.isVerified ? 'Yes' : 'No'}</td>
                    <td>
                      <div
                        className={`sliding-switch-container ${user.role === 'admin' ? 'admin-active' : ''}`}
                        onClick={() => handleToggleClick(user)}
                      >
                        <motion.div
                          className="sliding-switch-handle"
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.show && confirmModal.user && (
            <div className="modal-backdrop">
              <motion.div
                className="modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
              >
                <h3>Confirm Role Change</h3>
                <p>
                  Are you sure you want to change the role of <strong>{confirmModal.user.name}</strong> to{' '}
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {confirmModal.user.role === 'admin' ? 'customer' : 'admin'}
                  </span>?
                </p>
                {confirmModal.user.role !== 'admin' && (
                  <div className="modal-warning">
                    ⚠️ Warning: Promoting this user will grant them full admin control over all posts and configurations!
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmModal({ show: false, user: null })}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      toggleRole(confirmModal.user.id, confirmModal.user.role);
                      setConfirmModal({ show: false, user: null });
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Admin;
