const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishFacebook = async (post) => {
  await mockDelay();
  return { platform: 'facebook', success: true, message: 'Posted to Facebook successfully (mocked)' };
};

module.exports = publishFacebook;
