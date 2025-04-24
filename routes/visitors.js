
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { visitProfile, getVisitors, getVisited } = require('../controllers/VisitorsController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/post-visit', authenticateMiddleware, visitProfile);
router.get('/visitors/:userId', authenticateMiddleware, getVisitors);
router.get('/visited/:userId', authenticateMiddleware, getVisited);

module.exports = router;