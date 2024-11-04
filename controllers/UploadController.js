const User = require("../models/user");

const uploadImage = async (req, res) => {
    try {
        if (req.file) {
            const imageUrl = req.file.path;
            const userId = req.body.userId;

            const user = await User.findByIdAndUpdate(userId, { profilePhoto: imageUrl }, { new: true });

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ imageUrl: imageUrl });
        } else {
            return res.status(400).json({ message: 'Image upload failed.' });
        }
    } catch (error) {
        console.error('Error saving image URL to database:', error);
        return res.status(500).json({ message: 'An error occurred while uploading the image.' });
    }
};

module.exports = uploadImage 