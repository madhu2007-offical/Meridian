const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishX = async (post) => {
  await mockDelay();
  return { platform: 'x', success: true, message: 'Posted to X successfully (mocked)' };
};

module.exports = publishX;
