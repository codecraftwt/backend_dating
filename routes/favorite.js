const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.get('/:userId', authenticateMiddleware, getFavorites);
router.post('/add', authenticateMiddleware, addFavorite);
router.post('/remove', authenticateMiddleware, removeFavorite);

module.exports = router;