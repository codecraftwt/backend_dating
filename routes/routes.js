
const express = require('express')
const authRoutes = require('./auth');
const userRoutes = require('./user');
const visitorsRoutes = require('./visitors');
const likesRoutes = require('./likes');
const uploadRoutes = require('./upload');
const chatRoutes = require('./chat');
const chatNewRoutes = require('./chatNew');
const favoriteRoutes = require('./favorite');

const router = express();

router.get('/', (req, res) => {
    res.send('List of products');
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/visitors', visitorsRoutes);
router.use('/likes', likesRoutes);
router.use('/uploads', uploadRoutes);
router.use('/messages', chatRoutes);
router.use('/chat', chatNewRoutes);
router.use('/favorite', favoriteRoutes);

module.exports = router;
