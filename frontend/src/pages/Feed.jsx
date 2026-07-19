import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import { ALL_PLATFORMS, PLATFORM_LIMITS } from '../utils/platformLimits';
import api from '../api/axios';

const statusColors = {
  draft: '#6b7280',
  scheduled: '#f59e0b',
  published: '#10b981',
  failed: '#ef4444',
};

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;
      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, platformFilter]);

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

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateCalendarDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const daysArray = [];

    // Fill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthTotalDays - i),
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Fill next month days to complete a standard 6-row grid (42 cells)
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return daysArray;
  };

  const calendarDays = generateCalendarDays();

  // Container variants for staggered animation on filter changes
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  return (
    <PageTransition>
      <div className="page feed-page">
        <div className="page-header">
          <div>
            <h1>Your Feed</h1>
            <p>Manage and track your schedule</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="view-toggle">
              <button
                className={`btn btn-secondary btn-sm ${view === 'list' ? 'active-toggle' : ''}`}
                onClick={() => setView('list')}
              >
                List View
              </button>
              <button
                className={`btn btn-secondary btn-sm ${view === 'calendar' ? 'active-toggle' : ''}`}
                onClick={() => setView('calendar')}
              >
                Calendar View
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/composer')}>
              + New Post
            </button>
          </div>
        </div>

        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="">All platforms</option>
            {ALL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LIMITS[p].label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="center-page">
            <Spinner size={40} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list-view"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="post-list"
              >
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <p>No posts found. Create your first post!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/composer')}>
                      Compose Post
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {posts.map((post, i) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        index={i}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="calendar-wrapper"
              >
                <div className="calendar-header">
                  <button className="btn btn-secondary btn-sm" onClick={prevMonth}>
                    &larr; Prev
                  </button>
                  <h2>{monthNames[month]} {year}</h2>
                  <button className="btn btn-secondary btn-sm" onClick={nextMonth}>
                    Next &rarr;
                  </button>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="calendar-weekday-header">
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    const dayPosts = posts.filter((p) => {
                      if (!p.scheduledAt) return false;
                      const pDate = new Date(p.scheduledAt);
                      return pDate.toDateString() === day.date.toDateString();
                    });

                    return (
                      <div
                        key={idx}
                        className={`calendar-day-cell ${day.isCurrentMonth ? 'current' : 'outside'} ${
                          day.date.toDateString() === new Date().toDateString() ? 'today' : ''
                        }`}
                      >
                        <span className="day-number">{day.day}</span>
                        <div className="day-dots">
                          {dayPosts.map((p) => (
                            <motion.div
                              key={p._id}
                              className="calendar-post-dot"
                              style={{ backgroundColor: statusColors[p.status] || '#f59e0b' }}
                              title={`${p.platforms.join(', ').toUpperCase()}: ${p.content?.text?.slice(0, 30)}...`}
                              onClick={() => handleEdit(p)}
                              whileHover={{ scale: 1.3 }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
};

export default Feed;
