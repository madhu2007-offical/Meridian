const mongoose = require('mongoose');

const publishResultSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    success: { type: Boolean, required: true },
    message: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      text: { type: String, default: '' },
      mediaUrls: { type: [String], default: [] },
    },
    platforms: { type: [String], default: [] },
    platformMeta: {
      reddit: {
        subreddit: { type: String, default: '' },
        title: { type: String, default: '' },
      },
      x: { type: mongoose.Schema.Types.Mixed, default: {} },
      linkedin: { type: mongoose.Schema.Types.Mixed, default: {} },
      facebook: { type: mongoose.Schema.Types.Mixed, default: {} },
      instagram: { type: mongoose.Schema.Types.Mixed, default: {} },
      threads: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed', 'deleted'],
      default: 'draft',
    },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    publishResults: { type: [publishResultSchema], default: [] },
    failureCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
