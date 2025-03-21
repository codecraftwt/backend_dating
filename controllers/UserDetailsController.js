const { StatusCodes } = require("http-status-codes");
const userDetails = require("../models/userDetails");
const User = require("../models/user");

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userDetails.findOne({ userId }).select('-password');    

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(StatusCodes.OK).json({ userDetails: user, message: 'User details fetched successfully', status: StatusCodes.OK, success: true });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const createUserDetails = async (req, res) => {
    try{
        // Extract user ID from authenticated request
        const userId = req.user.id; // From the token

       // Check if user details already exist
       const existingDetails = await userDetails.findOne({ userId });
       if (existingDetails) {
           return res.status(StatusCodes.BAD_REQUEST).json({ 
               message: 'User details already exist' 
           });
       }

       // Create new user details
       const newDetails = new userDetails({
            userId,
            ...req.body
        });
        await newDetails.save();

        res.status(StatusCodes.CREATED).json({ message: 'User details created successfully', newDetails });

    }catch(error){
        console.error('Error creating user details:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
}

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

module.exports = { getUserDetails, createUserDetails , updateUserDetails };