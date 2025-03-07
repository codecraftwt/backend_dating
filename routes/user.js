
const express = require('express');
const multer = require('multer');
const authenticateMiddleware = require('../middlewares/Authenticcate');
const { createUser, getUserProfile, updateUserProfile, deleteUser, getAllUsers, getMatchingUsers } = require('../controllers/UserController');
const router = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // File will be saved to 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Adds a timestamp to the filename
    }
});

// Multer filter to accept only certain types of files (like PDF or image files)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
};

const upload = multer({ storage, fileFilter }); // Create multer instance with config

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.get('/', (req, res) => {
    res.send('List of products auth');
});

router.post('/signup',upload.single('biodata'), createUser);
router.get('/all', authenticateMiddleware, getAllUsers);
router.get('/matching-users', authenticateMiddleware, getMatchingUsers);
router.get('/:id', authenticateMiddleware, getUserProfile);
router.put('/:id', authenticateMiddleware, updateUserProfile);
router.delete('/:id', authenticateMiddleware, deleteUser);

module.exports = router;