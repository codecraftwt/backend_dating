
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { visitProfile, getVisitors, getVisited } = require('../controllers/VisitorsController');
const  checkSubscription  = require('../middlewares/subscriptionCheck');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/post-visit', authenticateMiddleware, visitProfile);
router.get('/visitors/:userId', authenticateMiddleware, checkSubscription(['Premium PLUS','Premium ULTRA']), getVisitors);
router.get('/visited/:userId', authenticateMiddleware, checkSubscription(['Premium PLUS','Premium ULTRA']), getVisited);

module.exports = router;