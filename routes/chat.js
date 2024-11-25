
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { getMessage, sendMessage, getRooms, createRoom } = require('../controllers/ChatController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.post('/', authenticateMiddleware, sendMessage);
router.get('/rooms', authenticateMiddleware, getRooms);
router.post('/create-room', authenticateMiddleware, createRoom);
router.get('/:roomId', authenticateMiddleware, getMessage);
router.delete('/:roomId', authenticateMiddleware, getMessage);

module.exports = router;