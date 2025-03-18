const { StatusCodes } = require("http-status-codes");
const userDetails = require("../models/userDetails");

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userDetails.findById(userId).select('-password');    

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(StatusCodes.OK).json({ user: user, message: 'User details fetched successfully', status: StatusCodes.OK, success: true });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const user = await userDetails.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }    

        res.status(StatusCodes.OK).json({ message: 'User details updated successfully', user });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
}

module.exports = { getUserDetails, updateUserDetails };