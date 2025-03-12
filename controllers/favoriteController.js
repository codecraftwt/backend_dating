const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");

// Add user to favorites
const addFavorite = async (req, res) => {
    try {
        const { favoriteUserId } = req.body;
        const loggedInUserId = req.user.id; // Assuming user ID comes from authentication middleware
        
        if (!favoriteUserId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Favorite user ID is required" });
        }

        if (loggedInUserId === favoriteUserId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "You cannot favorite yourself" });
        }

        const loggedInUser = await User.findById(loggedInUserId);
        const favoriteUser = await User.findById(favoriteUserId);
        if (!loggedInUser || !favoriteUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        }

        // Check if the user is already in favorites
        if (loggedInUser.favorites.includes(favoriteUserId)) {
            return res.status(StatusCodes.OK).json({ success: false, message: "User is already in favorites" });
        }

        // Add the favorite user
        loggedInUser.favorites.push(favoriteUserId);
        await loggedInUser.save();

        // Set isFavorited to true for the favorite user
        favoriteUser.isFavorited = true;
        await favoriteUser.save();

        return res.status(StatusCodes.OK).json({ success: true, message: "User added to favorites", data: { user: favoriteUser, isFavorited: true } });

    } catch (error) {
        console.error("Error adding favorite:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
};

// Remove user from favorites
const removeFavorite = async (req, res) => {
    try {
        const { favoriteUserId } = req.body;
        const loggedInUserId = req.user.id;

        const loggedInUser = await User.findById(loggedInUserId);
        const favoriteUser = await User.findById(favoriteUserId);
        if (!loggedInUser || !favoriteUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        }

        // Remove user from favorites list
        loggedInUser.favorites = loggedInUser.favorites.filter(id => id.toString() !== favoriteUserId);
        await loggedInUser.save();

        // Set isFavorited to false for the removed user
        favoriteUser.isFavorited = false;
        await favoriteUser.save();

        return res.status(StatusCodes.OK).json({ success: true, message: "User removed from favorites", data: { user: favoriteUser, isFavorited: false } });

    } catch (error) {
        console.error("Error removing favorite:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
};

// Get all favorite users of logged-in user
const getFavorites = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
    }

    try {
        const user = await User.findById(userId).populate({
            path: "favorites",
            model: "users",
            select: "firstName lastName age likes profilePhoto email isLiked isFavorited"
        });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }

        return res.status(StatusCodes.OK).json({ favorites: user.favorites });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error retrieving favorites", error: error.message });
    }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
