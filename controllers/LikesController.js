const { StatusCodes } = require("http-status-codes");
const Likes = require('./../models/likes');
const User = require("../models/user");

const likeProfile1 = async (req, res) => {
    const { userId, likedProfileId } = req.body;

    if (!userId || !likedProfileId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID and Liked Profile ID are required' });
    }

    try {
        const existingLike = await Likes.findOne({ userId, likedProfileId });

        if (existingLike) {
            existingLike.isLike = !existingLike.isLike;

            if (existingLike.isLike) {
                await User.findByIdAndUpdate(likedProfileId, { $inc: { likes: 1 } });
            } else {
                const likedUser = await User.findById(likedProfileId);
                if (likedUser.likes > 0) { // Ensure likes never go negative
                    await User.findByIdAndUpdate(likedProfileId, { $inc: { likes: -1 } });
                }
            }

            await Likes.findByIdAndUpdate(existingLike._id, existingLike);
            return res.status(StatusCodes.OK).json({ 
                message: `Profile ${existingLike.isLike ? 'liked' : 'disliked'} successfully`, 
                existingLike 
            });
        }

        const like = new Likes({ userId, likedProfileId, isLike: true });
        await like.save();
        await User.findByIdAndUpdate(likedProfileId, { $inc: { likes: 1 } });

        res.status(StatusCodes.CREATED).json({ message: 'Profile liked successfully', like });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error liking profile', error: error.message });
    }
};

const likeProfile = async (req, res) => {
    const { userId, likedProfileId } = req.body;

    if (!userId || !likedProfileId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID and Liked Profile ID are required' });
    }

    try {
        const existingLike = await Likes.findOne({ userId, likedProfileId });

        if (existingLike) {
            existingLike.isLike = !existingLike.isLike;

            // Toggle `isLiked` in the user schema
            await User.findByIdAndUpdate(likedProfileId, {
                $inc: { likes: existingLike.isLike ? 1 : -1 },
                isLiked: existingLike.isLike, // Update isLiked field
            });

            await existingLike.save();

            return res.status(StatusCodes.OK).json({ 
                message: `Profile ${existingLike.isLike ? 'liked' : 'disliked'} successfully`, 
                isLiked: existingLike.isLike 
            });
        }

        // If no previous like exists, create a new like
        const newLike = new Likes({ userId, likedProfileId, isLike: true });
        await newLike.save();

        await User.findByIdAndUpdate(likedProfileId, {
            $inc: { likes: 1 },
            isLiked: true, // Set isLiked to true
        });

        res.status(StatusCodes.CREATED).json({ message: 'Profile liked successfully', isLiked: true });

    } catch (error) {
        console.error("Error liking profile:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error liking profile', error: error.message });
    }
};

// const getLikedProfiles = async (req, res) => {
//     const { profileId } = req.params;

//     if (!profileId) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Profile ID is required' });
//     }

//     try {
//         const likes = await Likes.find({ likedProfileId: profileId })
//         // .populate('userId', 'firslastNamtName e email');

//         res.status(StatusCodes.OK).json(likes);
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching likes', error: error.message });
//     }
// }

const getLikedProfiles = async (req, res) => {
    const { profileId } = req.params;
    const {loggedInUserId} = req.query;
    
    if (!profileId || !loggedInUserId) {
        return res.status(400).json({
            success: false,
            message: "Profile ID and Logged-in User ID are required"
        });
    }

    try {
        // Find the like entry for the logged-in user and profile
        const likeEntry = await Likes.findOne({ userId: loggedInUserId, likedProfileId: profileId });

        if (!likeEntry) {
            return res.status(404).json({
                success: false,
                message: "Like entry not found"
            });
        }

        return res.status(200).json({
            success: true,
            like: likeEntry // Return the like object directly
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching like data",
            error: error.message
        });
    }
};


module.exports = { likeProfile, getLikedProfiles };