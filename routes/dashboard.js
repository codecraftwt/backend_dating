
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { getProfilecompletePercentage } = require('../controllers/DashboardController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.get('/percentage/:userId', authenticateMiddleware, getProfilecompletePercentage);

module.exports = router;
