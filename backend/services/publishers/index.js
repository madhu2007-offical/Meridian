const publishX = require('./x');
const publishReddit = require('./reddit');
const publishLinkedIn = require('./linkedin');
const publishFacebook = require('./facebook');
const publishInstagram = require('./instagram');
const publishThreads = require('./threads');

const publishers = {
  x: publishX,
  reddit: publishReddit,
  linkedin: publishLinkedIn,
  facebook: publishFacebook,
  instagram: publishInstagram,
  threads: publishThreads,
};

const publishToPlatforms = async (post) => {
  const results = [];

  for (const platform of post.platforms) {
    const publisher = publishers[platform];
    if (!publisher) {
      results.push({ platform, success: false, message: `Unknown platform: ${platform}` });
      continue;
    }

    try {
      const result = await publisher(post);
      results.push({ ...result, publishedAt: new Date() });
    } catch (error) {
      results.push({
        platform,
        success: false,
        message: error.message || 'Publish failed',
        publishedAt: new Date(),
      });
    }
  }

  return results;
};

module.exports = { publishToPlatforms, publishers };
