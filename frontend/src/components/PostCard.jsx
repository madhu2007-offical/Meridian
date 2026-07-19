import { motion } from 'framer-motion';
import { PLATFORM_LIMITS } from '../utils/platformLimits';

const statusColors = {
  draft: '#6b7280',
  scheduled: '#f59e0b',
  published: '#10b981',
  failed: '#ef4444',
  deleted: '#9ca3af',
};

const PostCard = ({ post, onDelete, onEdit, index = 0, showAuthor = false }) => {
  const canEdit = post.status !== 'published' && post.status !== 'deleted';

  return (
    <motion.div
      className="post-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ overflow: 'hidden' }}
      layout
    >
      <div className="post-card-header">
        <span
          className="post-status"
          style={{
            backgroundColor: statusColors[post.status],
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {post.status}
          {post.status === 'scheduled' && (
            <motion.span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'inline-block',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </span>
        {showAuthor && post.author && (
          <span className="post-author">By {post.author.name || post.author.email}</span>
        )}
        <span className="post-date">{new Date(post.createdAt).toLocaleString()}</span>
      </div>

      <p className="post-text">{post.content?.text || '(no text)'}</p>

      {post.content?.mediaUrls?.length > 0 && (
        <div className="post-media-preview-gallery-row" style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
          {post.content.mediaUrls.map((url, i) => (
            <div key={i} className="post-media-item" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img
                src={url}
                alt="attachment"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/100x100?text=Attachment';
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="platform-chips">
        {post.platforms?.map((p) => (
          <span key={p} className="platform-chip" style={{ borderColor: PLATFORM_LIMITS[p]?.color, color: PLATFORM_LIMITS[p]?.color }}>
            {PLATFORM_LIMITS[p]?.label || p}
          </span>
        ))}
      </div>

      {post.platformMeta?.reddit?.subreddit && (
        <p className="post-meta" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Reddit Destination: r/{post.platformMeta.reddit.subreddit} — &ldquo;{post.platformMeta.reddit.title}&rdquo;
        </p>
      )}

      {post.scheduledAt && post.status === 'scheduled' && (
        <p className="post-meta" style={{ fontWeight: 500, color: 'var(--warning)' }}>
          Scheduled: {new Date(post.scheduledAt).toLocaleString()}
        </p>
      )}

      {post.publishResults?.length > 0 && (
        <div className="publish-results">
          {post.publishResults.map((r, i) => (
            <span key={i} className={`result-badge ${r.success ? 'success' : 'fail'}`}>
              {PLATFORM_LIMITS[r.platform]?.label || r.platform}: {r.success ? 'OK' : 'Failed'}
            </span>
          ))}
        </div>
      )}

      <div className="post-actions">
        {canEdit && onEdit && (
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(post)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(post._id)}>
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
