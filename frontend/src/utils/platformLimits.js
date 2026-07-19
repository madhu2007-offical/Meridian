export const PLATFORM_LIMITS = {
  x: { textLimit: 280, maxMedia: 4, label: 'X', color: '#000' },
  reddit: { textLimit: 40000, titleLimit: 300, label: 'Reddit', color: '#ff4500' },
  linkedin: { textLimit: 3000, maxMedia: 9, label: 'LinkedIn', color: '#0a66c2' },
  facebook: { textLimit: 63206, maxMedia: 10, label: 'Facebook', color: '#1877f2' },
  instagram: { textLimit: 2200, minMedia: 1, label: 'Instagram', color: '#e4405f' },
  threads: { textLimit: 500, maxMedia: 10, label: 'Threads', color: '#000' },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_LIMITS);

export const validatePost = (content, platforms, platformMeta) => {
  const errors = {};
  const text = content.text || '';
  const mediaUrls = content.mediaUrls || [];

  for (const platform of platforms) {
    const limits = PLATFORM_LIMITS[platform];
    if (!limits) continue;

    const platformErrors = [];

    if (text.length > limits.textLimit) {
      platformErrors.push(`${limits.label}: text exceeds ${limits.textLimit} chars (${text.length})`);
    }
    if (limits.maxMedia !== undefined && mediaUrls.length > limits.maxMedia) {
      platformErrors.push(`${limits.label}: max ${limits.maxMedia} media allowed`);
    }
    if (limits.minMedia !== undefined && mediaUrls.length < limits.minMedia) {
      platformErrors.push(`${limits.label}: requires at least ${limits.minMedia} media`);
    }
    if (platform === 'reddit') {
      if (!platformMeta?.reddit?.title?.trim()) platformErrors.push('Reddit: title required');
      else if (platformMeta.reddit.title.length > limits.titleLimit) platformErrors.push(`Reddit: title exceeds ${limits.titleLimit} chars`);
      if (!platformMeta?.reddit?.subreddit?.trim()) platformErrors.push('Reddit: subreddit required');
    }

    if (platformErrors.length > 0) {
      errors[platform] = platformErrors;
    }
  }

  return errors;
};

export const getStrictestTextLimit = (platforms) => {
  if (!platforms.length) return Infinity;
  return Math.min(...platforms.map((p) => PLATFORM_LIMITS[p]?.textLimit || Infinity));
};
