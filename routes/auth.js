
const express = require('express');
const { login, search, signin, logout, sendOtp, checkIsEmail, resetPassword } = require('../controllers/AuthController');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/login', login);
router.post('/signin', signin);
router.get('/signout', logout);
router.get('/search', search);
router.post('/send-otp', sendOtp);
router.post('/check-email', checkIsEmail);
router.post('/reset-password', resetPassword);


module.exports = router;
