const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishInstagram = async (post) => {
  await mockDelay();
  const mediaUrls = post.content?.mediaUrls || [];
  if (mediaUrls.length === 0) {
    return { platform: 'instagram', success: false, message: 'Instagram requires at least one media URL' };
  }
  return { platform: 'instagram', success: true, message: 'Posted to Instagram successfully (mocked)' };
};

module.exports = publishInstagram;
