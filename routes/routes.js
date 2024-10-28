
const express = require('express')
const authRoutes = require('./auth');
const userRoutes = require('./user');
const visitorsRoutes = require('./visitors');

const router = express();

router.get('/', (req, res) => {
    res.send('List of products');
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/visitors', visitorsRoutes);

module.exports = router;
