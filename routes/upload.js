const express = require('express');
const uploadImage = require('../controllers/UploadController.js');
const router = express.Router();

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dwwykeft2',
    api_key: '171225899953946',
    api_secret: 'cNv0XKbJqqg10440xozFTLZVrrk',
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const parser = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post('/image', parser.single('image'), uploadImage);


module.exports = router;
