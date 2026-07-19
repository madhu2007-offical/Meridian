const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishReddit = async (post) => {
  await mockDelay();
  const subreddit = post.platformMeta?.reddit?.subreddit?.trim();
  if (!subreddit) {
    return { platform: 'reddit', success: false, message: 'Subreddit is required for Reddit' };
  }
  return {
    platform: 'reddit',
    success: true,
    message: `Posted to r/${subreddit} successfully (mocked)`,
  };
};

module.exports = publishReddit;
