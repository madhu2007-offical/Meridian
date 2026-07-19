const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

const { processScheduledPosts } = require('../services/scheduler');

router.get('/', postController.getPlatforms);

router.get('/trigger-scheduler', async (req, res) => {
  try {
    await processScheduledPosts();
    res.json({ message: 'Scheduler triggered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
