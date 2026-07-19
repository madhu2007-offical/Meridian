const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/users', auth, roleCheck('admin'), adminController.getUsers);
router.patch('/users/:id/role', auth, roleCheck('admin'), adminController.updateUserRole);
router.get('/posts', auth, roleCheck('admin'), adminController.getAllPosts);

module.exports = router;
