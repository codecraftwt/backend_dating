
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { visitProfile, getVisitors } = require('../controllers/VisitorsController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/visit', authenticateMiddleware, visitProfile);
router.get('/:userId', authenticateMiddleware, getVisitors);
// router.put('/:id', authenticateMiddleware, updateUserProfile);
// router.delete('/:id', authenticateMiddleware, deleteUser);

module.exports = router;