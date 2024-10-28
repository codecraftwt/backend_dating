
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { likeProfile, getLikedProfiles } = require('../controllers/LikesController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/like-profile', authenticateMiddleware, likeProfile);
router.get('/:profileId', authenticateMiddleware, getLikedProfiles);

module.exports = router;