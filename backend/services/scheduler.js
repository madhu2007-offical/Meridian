const cron = require('node-cron');
const Post = require('../models/Post');
const { validatePostForPlatforms } = require('../utils/platformValidators');
const { publishToPlatforms } = require('./publishers');

const processScheduledPosts = async () => {
  const now = new Date();
  const duePosts = await Post.find({
    status: 'scheduled',
    isDeleted: false,
    scheduledAt: { $lte: now },
  });

  for (const post of duePosts) {
    try {
      const validation = validatePostForPlatforms(post);
      if (!validation.valid) {
        post.failureCount = (post.failureCount || 0) + 1;
        if (post.failureCount >= 3) {
          post.status = 'failed';
        }
        await post.save();
        console.log(`Scheduled post ${post._id} failed validation`);
        continue;
      }

      const results = await publishToPlatforms(post);
      const allSuccess = results.every((r) => r.success);

      post.publishResults = [...(post.publishResults || []), ...results];
      post.failureCount = allSuccess ? 0 : (post.failureCount || 0) + 1;

      if (allSuccess) {
        post.status = 'published';
        post.publishedAt = new Date();
        console.log(`Scheduled post ${post._id} published successfully`);
      } else if (post.failureCount >= 3) {
        post.status = 'failed';
        console.log(`Scheduled post ${post._id} marked as failed after 3+ attempts`);
      } else {
        console.log(`Scheduled post ${post._id} partial/failed publish, attempt ${post.failureCount}`);
      }

      await post.save();
    } catch (error) {
      console.error(`Error processing scheduled post ${post._id}:`, error.message);
      post.failureCount = (post.failureCount || 0) + 1;
      if (post.failureCount >= 3) {
        post.status = 'failed';
      }
      await post.save();
    }
  }
};

const startScheduler = () => {
  const cronExpression = process.env.SCHEDULER_INTERVAL_CRON || '*/1 * * * *';

  cron.schedule(cronExpression, () => {
    processScheduledPosts().catch((err) => console.error('Scheduler error:', err.message));
  });

  console.log(`Post scheduler started with cron: ${cronExpression}`);
};

module.exports = { startScheduler, processScheduledPosts };
