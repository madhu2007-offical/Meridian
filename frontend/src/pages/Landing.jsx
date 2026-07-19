import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { PLATFORM_LIMITS } from '../utils/platformLimits';

const Landing = () => {
  const navigate = useNavigate();

  const platforms = Object.entries(PLATFORM_LIMITS).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const features = [
    {
      icon: '✍️',
      title: 'Unified Composer',
      desc: 'Write your post once and adapt it for all target platforms from a single intuitive composer.',
    },
    {
      icon: '✓',
      title: 'Live Validation',
      desc: 'Get immediate inline validation feedback on character counts and media sizes as you type.',
    },
    {
      icon: '⏰',
      title: 'Smart Scheduling',
      desc: 'Schedule posts to release automatically at peak times or publish instantly across networks.',
    },
    {
      icon: '🛡️',
      title: 'Team Administration',
      desc: 'Role-based access lets team admins review all posts and manage member permissions smoothly.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  };

  return (
    <PageTransition>
      <div className="landing-page" style={{ paddingBottom: '4rem' }}>
        {/* Public Header/Hero */}
        <section className="landing-hero">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Meridian
          </motion.h1>
          <motion.p
            className="landing-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Publish across platforms simultaneously. Write cleanly, schedule intelligently, and reach everywhere.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Log In
            </button>
          </motion.div>
        </section>

        {/* Platform Showcase */}
        <section className="landing-section">
          <h2>Supported Platforms</h2>
          <motion.div
            className="platform-showcase-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            {platforms.map((p) => (
              <motion.div
                key={p.id}
                className="platform-showcase-card"
                variants={itemVariants}
                whileHover={{ y: -4, borderColor: p.color }}
                style={{ '--platform-color': p.color }}
              >
                <span className="platform-icon" style={{ color: p.color }}>●</span>
                <h3>{p.label}</h3>
                <p>{p.textLimit.toLocaleString()} characters limit</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features */}
        <section className="landing-section">
          <h2>Key Features</h2>
          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((f, i) => (
              <motion.div key={i} className="feature-item-card" variants={itemVariants}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Demo Portals */}
        <section className="landing-section portals-section">
          <h2>Access Portals</h2>
          <div className="portals-grid">
            <div className="portal-card">
              <h3>Customer Portal</h3>
              <p>Compose, draft, and schedule posts. View your timeline and publishing queue.</p>
              <Link to="/login" className="portal-link">Enter Customer Portal &rarr;</Link>
            </div>
            <div className="portal-card">
              <h3>Admin Console</h3>
              <p>Manage all posts, inspect team activity, and configure member roles.</p>
              <Link to="/login" className="portal-link">Enter Admin Console &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>&copy; {new Date().getFullYear()} Meridian. All rights reserved.</p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
