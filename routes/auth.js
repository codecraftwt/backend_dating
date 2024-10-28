
const express = require('express');
const { login, search, signin, logout } = require('../controllers/AuthCOntroller');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/login', login);
router.post('/signin', signin);
router.post('/signout', logout);
router.get('/search', search);


module.exports = router;
