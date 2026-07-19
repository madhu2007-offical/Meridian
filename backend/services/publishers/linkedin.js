const mockDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

const publishLinkedIn = async (post) => {
  await mockDelay();
  return { platform: 'linkedin', success: true, message: 'Posted to LinkedIn successfully (mocked)' };
};

module.exports = publishLinkedIn;
