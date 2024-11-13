
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { getMessage, sendMessage } = require('../controllers/ChatController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.post('/', authenticateMiddleware, sendMessage);
router.get('/:roomId', authenticateMiddleware, getMessage);

module.exports = router;