const express = require('express');
const uploadImage = require('../controllers/UploadController.js');
const router = express.Router();
const cloudinary = require("../config/cloudinary"); 
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {sendMessage} = require('../controllers/ChatNewController.js');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const parser = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

// chat files storage
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        "chat_files",
    resource_type: "auto",
  }
});
const uploadChatParser = multer({
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/image', parser.single('image'), uploadImage);
router.post("/chat/:roomId/messages", uploadChatParser.array("files", 10),sendMessage);

module.exports = router;
