
const express = require('express')
const authRoutes = require('./auth');

const router = express();

router.get('/', (req, res) => {
    res.send('List of products');
});

router.use('/auth', authRoutes);

module.exports = router;
