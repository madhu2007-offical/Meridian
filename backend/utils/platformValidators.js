const PLATFORM_LIMITS = {
  x: { textLimit: 280, maxMedia: 4, label: 'X' },
  reddit: { textLimit: 40000, titleLimit: 300, label: 'Reddit' },
  linkedin: { textLimit: 3000, maxMedia: 9, label: 'LinkedIn' },
  facebook: { textLimit: 63206, maxMedia: 10, label: 'Facebook' },
  instagram: { textLimit: 2200, minMedia: 1, label: 'Instagram' },
  threads: { textLimit: 500, maxMedia: 10, label: 'Threads' },
};

const validatePostForPlatforms = (post) => {
  const errors = {};
  const { content, platforms, platformMeta } = post;
  const text = content?.text || '';
  const mediaUrls = content?.mediaUrls || [];

  for (const platform of platforms) {
    const limits = PLATFORM_LIMITS[platform];
    const platformErrors = [];

    if (!limits) {
      platformErrors.push(`Unknown platform: ${platform}`);
      errors[platform] = platformErrors;
      continue;
    }

    if (text.length > limits.textLimit) {
      platformErrors.push(`${limits.label} text exceeds ${limits.textLimit} characters (${text.length})`);
    }

    if (limits.maxMedia !== undefined && mediaUrls.length > limits.maxMedia) {
      platformErrors.push(`${limits.label} allows max ${limits.maxMedia} media (${mediaUrls.length})`);
    }

    if (limits.minMedia !== undefined && mediaUrls.length < limits.minMedia) {
      platformErrors.push(`${limits.label} requires at least ${limits.minMedia} media attachment`);
    }

    if (platform === 'reddit') {
      const redditMeta = platformMeta?.reddit || {};
      if (!redditMeta.title?.trim()) {
        platformErrors.push('Reddit requires a title');
      } else if (redditMeta.title.length > limits.titleLimit) {
        platformErrors.push(`Reddit title exceeds ${limits.titleLimit} characters`);
      }
      if (!redditMeta.subreddit?.trim()) {
        platformErrors.push('Reddit requires a subreddit');
      }
    }

    if (platformErrors.length > 0) {
      errors[platform] = platformErrors;
    }
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
};

module.exports = { PLATFORM_LIMITS, validatePostForPlatforms };
