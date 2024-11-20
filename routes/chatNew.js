
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { createRoom, sendMessage, getAllRooms, getRoom } = require('../controllers/ChatNewController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.post('/create-room', authenticateMiddleware, createRoom);
router.post('/:roomId/messages', authenticateMiddleware, sendMessage);
router.get('/rooms', authenticateMiddleware, getAllRooms);
router.get('/rooms/:roomId', authenticateMiddleware, getRoom);

module.exports = router;