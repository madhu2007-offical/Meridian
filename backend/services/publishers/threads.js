const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishThreads = async (post) => {
  await mockDelay();
  return { platform: 'threads', success: true, message: 'Posted to Threads successfully (mocked)' };
};

module.exports = publishThreads;
