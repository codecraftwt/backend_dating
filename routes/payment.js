
const express = require('express');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { createCheckoutSession, confirmPayment } = require('../controllers/PaymentController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/create-checkout-session', authenticateMiddleware, createCheckoutSession);
router.post('/confirm-payment', authenticateMiddleware, confirmPayment);

module.exports = router;