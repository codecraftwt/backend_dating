
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { createUser, getUserProfile, updateUserProfile, deleteUser, getAllUsers } = require('../controllers/UserController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/signup', createUser);
router.get('/all', authenticateMiddleware, getAllUsers);
router.get('/:id', authenticateMiddleware, getUserProfile);
router.put('/:id', authenticateMiddleware, updateUserProfile);
router.delete('/:id', authenticateMiddleware, deleteUser);

module.exports = router;