const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const calculateAge = require("../utils/getAge");
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const createUser = async (req, res) => {
    try {
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, password } = req.body;

        const requiredFields = [
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password
        ];

        if (requiredFields.some(field => !field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const age = await calculateAge(dob)
        const user = new User({
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password: hashedPassword,
            age: age
        });

        await user.save();
        // await sendMail1(email);
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
        res.status(StatusCodes.CREATED).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No users found' });
        }

        res.status(StatusCodes.OK).json({ data: users, status: StatusCodes.OK, success: true, message: 'Users fetched successfully!!' });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const getMatchingUsers = async (req, res) => {
    try {
        const users = await User.find().select('gender firstName lastName dob age profilePhoto');

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No users found' });
        }

        res.status(StatusCodes.OK).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile } = req.body;

        const updatedData = { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile };

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(StatusCodes.OK).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

module.exports = { createUser, getUserProfile, getAllUsers, updateUserProfile, deleteUser, getMatchingUsers }