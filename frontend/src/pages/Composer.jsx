import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';
import {
  ALL_PLATFORMS,
  PLATFORM_LIMITS,
  validatePost,
  getStrictestTextLimit,
} from '../utils/platformLimits';
import api from '../api/axios';

const emptyMeta = {
  reddit: { subreddit: '', title: '' },
  x: {},
  linkedin: {},
  facebook: {},
  instagram: {},
  threads: {},
};

const Composer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [text, setText] = useState('');
  const [mediaInput, setMediaInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [platformMeta, setPlatformMeta] = useState(emptyMeta);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    api
      .get(`/posts/${editId}`)
      .then((res) => {
        const post = res.data.post;
        setText(post.content?.text || '');
        setMediaUrls(post.content?.mediaUrls || []);
        setPlatforms(post.platforms || []);
        setPlatformMeta({ ...emptyMeta, ...post.platformMeta });
        if (post.scheduledAt) {
          setScheduleEnabled(true);
          setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
        }
        setPublishImmediately(post.status === 'published' || post.status === 'failed');
      })
      .catch(() => showToast('Failed to load post', 'error'))
      .finally(() => setFetching(false));
  }, [editId]);

  const togglePlatform = (p) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const addMediaUrl = () => {
    const url = mediaInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setMediaUrls((prev) => [...prev, url]);
      setMediaInput('');
    } catch {
      showToast('Enter a valid URL', 'error');
    }
  };

  const removeMedia = (index) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const content = { text, mediaUrls };
  const errors = platforms.length ? validatePost(content, platforms, platformMeta) : {};
  const hasErrors = Object.keys(errors).length > 0;
  const strictLimit = getStrictestTextLimit(platforms);
  const charCount = text.length;
  const overLimit = strictLimit !== Infinity && charCount > strictLimit;
  const hasReddit = platforms.includes('reddit');

  // Submit button mode determination
  let buttonText = 'Save Draft';
  let buttonColor = '#6b7280';
  let buttonClass = 'btn-draft';

  if (scheduleEnabled) {
    buttonText = 'Schedule';
    buttonColor = '#f59e0b';
    buttonClass = 'btn-schedule';
  } else if (publishImmediately) {
    buttonText = 'Publish Now';
    buttonColor = '#6366f1';
    buttonClass = 'btn-publish';
  }

  const buildPayload = (status) => ({
    content: { text, mediaUrls },
    platforms,
    platformMeta,
    status,
    scheduledAt: scheduleEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platforms.length) {
      showToast('Select at least one platform', 'error');
      return;
    }

    const status = scheduleEnabled
      ? 'scheduled'
      : publishImmediately
      ? 'draft' // Immediate publish starts as draft on DB first
      : 'draft';

    if (status !== 'draft' && hasErrors) {
      showToast('Fix validation errors before submitting', 'error');
      return;
    }

    if (publishImmediately && hasErrors) {
      showToast('Fix validation errors before publishing', 'error');
      return;
    }

    setLoading(true);
    try {
      let postId = editId;
      const payload = buildPayload(status);

      if (editId) {
        await api.put(`/posts/${editId}`, payload);
      } else {
        const res = await api.post('/posts', payload);
        postId = res.data.post._id;
      }

      if (publishImmediately && !scheduleEnabled) {
        const pubRes = await api.post(`/posts/${postId}/publish`);
        showToast(pubRes.data.message, pubRes.data.results?.every((r) => r.success) ? 'success' : 'warning');
      } else if (scheduleEnabled) {
        showToast('Post scheduled successfully', 'success');
      } else {
        showToast('Draft saved successfully', 'success');
      }

      navigate('/feed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((e) => showToast(e.message || e, 'error'));
        } else {
          Object.values(validationErrors).flat().forEach((e) => showToast(e, 'error'));
        }
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="center-page">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page composer-page">
        <div className="page-header">
          <div>
            <h1>{editId ? 'Edit Post' : 'Compose Post'}</h1>
            <p>Create once, publish everywhere</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="composer-grid">
          <div className="composer-main">
            <div className="form-group">
              <label>Platforms</label>
              <div className="platform-selector-grid">
                {ALL_PLATFORMS.map((p) => {
                  const isSelected = platforms.includes(p);
                  const platformErrors = errors[p] || [];
                  return (
                    <div key={p} className="platform-chip-wrapper">
                      <motion.button
                        type="button"
                        className={`platform-chip-btn ${isSelected ? 'selected' : ''}`}
                        style={{ '--chip-color': PLATFORM_LIMITS[p].color }}
                        onClick={() => togglePlatform(p)}
                        whileTap={{ scale: 0.95 }}
                        animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        {PLATFORM_LIMITS[p].label}
                      </motion.button>
                      <AnimatePresence>
                        {isSelected && platformErrors.length > 0 && (
                          <motion.div
                            className="inline-error-banner"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {platformErrors.map((errText, idx) => (
                              <div key={idx} className="inline-error-text">
                                {errText}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="text">
                Post Content
              </label>
              <textarea
                id="text"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
              />
              
              {/* Character Limit Visual Bar */}
              {platforms.length > 0 && (
                <div className="char-limit-bars">
                  {platforms.map((p) => {
                    const lim = PLATFORM_LIMITS[p];
                    const pct = Math.min(100, (charCount / lim.textLimit) * 100);
                    const isOver = charCount > lim.textLimit;
                    return (
                      <div key={p} className="char-bar-row">
                        <div className="char-bar-header">
                          <span className="char-bar-label" style={{ color: lim.color }}>{lim.label}</span>
                          <span className={`char-bar-count ${isOver ? 'over' : ''}`}>
                            {charCount} / {lim.textLimit}
                          </span>
                        </div>
                        <div className="char-bar-track">
                          <motion.div
                            className="char-bar-fill"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${pct}%`,
                              backgroundColor: isOver ? 'var(--danger)' : pct > 85 ? 'var(--warning)' : lim.color,
                            }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <AnimatePresence>
              {hasReddit && (
                <motion.div
                  className="reddit-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group">
                    <label htmlFor="reddit-title">
                      Reddit Title
                      <span className="char-counter">{platformMeta.reddit.title.length} / 300</span>
                    </label>
                    <input
                      id="reddit-title"
                      value={platformMeta.reddit.title}
                      onChange={(e) =>
                        setPlatformMeta({ ...platformMeta, reddit: { ...platformMeta.reddit, title: e.target.value } })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subreddit">Subreddit</label>
                    <input
                      id="subreddit"
                      placeholder="e.g. webdev"
                      value={platformMeta.reddit.subreddit}
                      onChange={(e) =>
                        setPlatformMeta({ ...platformMeta, reddit: { ...platformMeta.reddit, subreddit: e.target.value } })
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-group">
              <label>Media URLs</label>
              <div className="media-input-row">
                <input
                  type="url"
                  placeholder="Paste image/video URL"
                  value={mediaInput}
                  onChange={(e) => setMediaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMediaUrl())}
                />
                <button type="button" className="btn btn-secondary" onClick={addMediaUrl}>
                  Add
                </button>
              </div>

              {/* Media visual thumbnail gallery */}
              <div className="media-preview-gallery">
                <AnimatePresence>
                  {mediaUrls.map((url, i) => (
                    <motion.div
                      key={url + i}
                      className="media-preview-card"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100?text=Invalid+URL';
                        }}
                        className="media-thumbnail"
                      />
                      <button
                        type="button"
                        className="media-delete-btn"
                        onClick={() => removeMedia(i)}
                      >
                        &times;
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Schedule / Action Toggles */}
            <div className="schedule-toggle">
              <div className="toggle-options-grid">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => {
                      setScheduleEnabled(e.target.checked);
                      if (e.target.checked) setPublishImmediately(false);
                    }}
                  />
                  Schedule for later
                </label>

                {!scheduleEnabled && (
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={publishImmediately}
                      onChange={(e) => setPublishImmediately(e.target.checked)}
                    />
                    Publish immediately
                  </label>
                )}
              </div>

              <AnimatePresence>
                {scheduleEnabled && (
                  <motion.div
                    className="schedule-picker-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <input
                      type="datetime-local"
                      required
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="schedule-input"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="composer-sidebar">
            {platforms.length > 0 && (
              <div className="limits-panel">
                <h3>Selected Limits</h3>
                {platforms.map((p) => {
                  const lim = PLATFORM_LIMITS[p];
                  return (
                    <div key={p} className="limit-row">
                      <span style={{ color: lim.color }}>{lim.label}</span>
                      <span>{charCount}/{lim.textLimit} chars</span>
                      {lim.maxMedia !== undefined && <span>{mediaUrls.length}/{lim.maxMedia} media</span>}
                      {lim.minMedia !== undefined && <span>min {lim.minMedia} media</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {platforms.length > 0 && !hasErrors && (
              <div className="validation-banner success">
                All selected platforms pass validation
              </div>
            )}

            {platforms.length > 0 && hasErrors && (
              <div className="validation-banner error">
                <h4>Validation Issues</h4>
                <ul>
                  {Object.values(errors).flat().map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="composer-actions">
              <motion.button
                type="submit"
                className={`btn btn-full ${buttonClass}`}
                disabled={loading || !platforms.length || (publishImmediately && hasErrors) || (scheduleEnabled && hasErrors)}
                animate={{
                  backgroundColor: buttonColor,
                  color: '#fff',
                }}
                transition={{ duration: 0.3 }}
              >
                {loading ? <Spinner size={20} /> : buttonText}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default Composer;
