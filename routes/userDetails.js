
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { getUserDetails,createUserDetails,updateUserDetails } = require('../controllers/UserDetailsController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of messages auth');
});

router.get('/:userId', authenticateMiddleware, getUserDetails);
router.post('/create', authenticateMiddleware, createUserDetails);
router.put('/:userId', authenticateMiddleware, updateUserDetails);

module.exports = router;