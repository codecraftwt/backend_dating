
const express = require('express');
const { login, search, signin } = require('../controllers/AuthCOntroller');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/login', login);
router.post('/signin', signin);
router.get('/search', search);


module.exports = router;
