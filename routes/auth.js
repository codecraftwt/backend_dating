
const express = require('express');
const { login, search, signin, logout, sendOtp } = require('../controllers/AuthCOntroller');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/login', login);
router.post('/signin', signin);
router.get('/signout', logout);
router.get('/search', search);
router.post('/send-otp', sendOtp);


module.exports = router;
