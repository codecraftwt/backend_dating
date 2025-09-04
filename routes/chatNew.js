
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { createRoom, sendMessage, getAllRooms, getRoom, deleteMessage, deleteRoom } = require('../controllers/ChatNewController');
const checkMessageLimit = require('../middlewares/checkMessageLimit');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.post('/create-room', authenticateMiddleware, createRoom);
router.post('/:roomId/messages', authenticateMiddleware, upload.array('file'), checkMessageLimit, sendMessage);
router.get('/rooms/:userId', authenticateMiddleware, getAllRooms);
router.get('/room/:roomId', authenticateMiddleware, getRoom);
router.delete('/room/:roomId', authenticateMiddleware, deleteRoom);
router.delete('/rooms/:roomId/messages/:messageId', authenticateMiddleware, deleteMessage);

module.exports = router;