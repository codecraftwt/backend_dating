const { StatusCodes } = require("http-status-codes");
const Likes = require('./../models/likes');
const User = require("../models/user");

const likeProfile = async (req, res) => {
    const { userId, likedProfileId } = req.body;

    if (!userId || !likedProfileId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID and Liked Profile ID are required' });
    }

    try {
        const existingLike = await Likes.findOne({ userId, likedProfileId });
        console.log(existingLike, '<=== existingLike')

        if (existingLike) {
            existingLike.isLike = !existingLike.isLike

            if (existingLike.isLike) {
                await User.findByIdAndUpdate(likedProfileId, { $inc: { likes: 1 } });
            } else {
                await User.findByIdAndUpdate(likedProfileId, { $inc: { likes: -1 } });
            }
            await Likes.findByIdAndUpdate(existingLike._id, existingLike);
            return res.status(StatusCodes.OK).json({ message: `Profile ${existingLike.isLike === true ? 'liked' : 'disliked'}  successfully`, existingLike });
        }

        const like = new Likes({ userId, likedProfileId, isLike: true });
        await like.save();

        res.status(StatusCodes.CREATED).json({ message: 'Profile liked successfully', like });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error liking profile', error: error.message });
    }
}

const getLikedProfiles = async (req, res) => {
    const { profileId } = req.params;

    if (!profileId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Profile ID is required' });
    }

    try {
        const likes = await Likes.find({ likedProfileId: profileId })
        // .populate('userId', 'firslastNamtName e email');

        res.status(StatusCodes.OK).json(likes);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching likes', error: error.message });
    }
}

module.exports = { likeProfile, getLikedProfiles };