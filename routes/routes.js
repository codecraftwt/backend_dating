
const express = require('express')
const authRoutes = require('./auth');
const userRoutes = require('./user');

const router = express();

router.get('/', (req, res) => {
    res.send('List of products');
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;
