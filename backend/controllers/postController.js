const Post = require('../models/Post');
const User = require('../models/User');
const { validatePostForPlatforms, PLATFORM_LIMITS } = require('../utils/platformValidators');
const { publishToPlatforms } = require('../services/publishers');

const sanitizePost = (post) => {
  const obj = post.toObject ? post.toObject() : post;
  return {
    ...obj,
    author: obj.author?._id ? { _id: obj.author._id, name: obj.author.name, email: obj.author.email } : obj.author,
  };
};

exports.createPost = async (req, res) => {
  try {
    const { content, platforms, platformMeta, status, scheduledAt } = req.body;

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'At least one platform must be selected' });
    }

    const postData = {
      author: req.user._id,
      content: content || { text: '', mediaUrls: [] },
      platforms,
      platformMeta: platformMeta || {},
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    };

    if (postData.status === 'scheduled' && !postData.scheduledAt) {
      return res.status(400).json({ message: 'Scheduled posts require a scheduledAt date' });
    }

    const validation = validatePostForPlatforms(postData);
    if (!validation.valid && postData.status !== 'draft') {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    const post = await Post.create(postData);
    const populated = await Post.findById(post._id).populate('author', 'name email');
    res.status(201).json({ post: sanitizePost(populated) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { status, platform } = req.query;
    const filter = { isDeleted: false };

    if (req.user.role !== 'admin') {
      filter.author = req.user._id;
    }

    if (status) filter.status = status;
    if (platform) filter.platforms = platform;

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({ posts: posts.map(sanitizePost) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ post: sanitizePost(post) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ message: 'Published posts cannot be edited' });
    }

    const { content, platforms, platformMeta, status, scheduledAt } = req.body;

    if (content !== undefined) post.content = content;
    if (platforms !== undefined) post.platforms = platforms;
    if (platformMeta !== undefined) post.platformMeta = platformMeta;
    if (status !== undefined) post.status = status;
    if (scheduledAt !== undefined) post.scheduledAt = scheduledAt;

    if (post.status === 'scheduled' && !post.scheduledAt) {
      return res.status(400).json({ message: 'Scheduled posts require a scheduledAt date' });
    }

    const validation = validatePostForPlatforms(post);
    if (!validation.valid && post.status !== 'draft') {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    await post.save();
    const populated = await Post.findById(post._id).populate('author', 'name email');
    res.json({ post: sanitizePost(populated) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    post.isDeleted = true;
    post.status = 'deleted';
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (post.status === 'published') {
      return res.status(400).json({ message: 'Post is already published' });
    }

    const validation = validatePostForPlatforms(post);
    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    const results = await publishToPlatforms(post);
    const allSuccess = results.every((r) => r.success);
    const anySuccess = results.some((r) => r.success);

    post.publishResults = [...(post.publishResults || []), ...results];
    post.failureCount = allSuccess ? 0 : (post.failureCount || 0) + 1;

    if (allSuccess) {
      post.status = 'published';
      post.publishedAt = new Date();
    } else if (post.failureCount >= 3) {
      post.status = 'failed';
    } else if (anySuccess) {
      post.status = 'published';
      post.publishedAt = new Date();
    }

    await post.save();
    const populated = await Post.findById(post._id).populate('author', 'name email');

    res.json({
      message: allSuccess ? 'Published successfully' : 'Some platforms failed',
      post: sanitizePost(populated),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlatforms = (req, res) => {
  const platforms = Object.entries(PLATFORM_LIMITS).map(([key, value]) => ({
    id: key,
    ...value,
  }));
  res.json({ platforms });
};
