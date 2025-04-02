const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const UserDetails = require("../models/userDetails");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const calculateAge = require("../utils/getAge");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// const createUser = async (req, res) => {
//     try {
//         const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, password } = req.body;

//         const requiredFields = [
//             profileFor, gender, firstName, lastName, dob, religion,
//             motherTongue, country, email, mobile, password
//         ];

//         if (requiredFields.some(field => !field)) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const age = await calculateAge(dob)
//         const user = new User({
//             profileFor, gender, firstName, lastName, dob, religion,
//             motherTongue, country, email, mobile, password: hashedPassword,
//             age: age
//         });

//         await user.save();
//         // await sendMail1(email);
//         const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
//         res.status(StatusCodes.CREATED).json({ message: 'User created successfully', token });
//     } catch (error) {
//         console.error('Error in signup route:', error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
//     }
// };
const createUser = async (req, res) => {
    try {
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, password, height, weight, education, maritalStatus, searchingFor, subscription } = req.body;
        const biodata = req.file ? req.file.path : null; // Get the file path from multer

        const requiredFields = [
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password, height, weight, education, maritalStatus, searchingFor, subscription
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
            age: age, biodata, height, weight, education, maritalStatus, searchingFor, subscription
        });

        await user.save();
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

        res.status(StatusCodes.OK).json({ user: user, message: 'User profile fetched successfully', status: StatusCodes.OK, success: true });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

const getAllUsers = async (req, res) => {
    const loggedInUserId = req.user.id;
    try {
        // const users = await User.find().select('-password'); //all users
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password'); // exclude loggedIn user

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
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, profilePhoto, otherPhotos } = req.body;

        const updatedData = { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, profilePhoto, otherPhotos };
        
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

const getUsersByPreference = async (req, res) => {
  try {
      // Get logged-in user's ID
      const loggedInUserId = req.user.id;

      // Validate ObjectID first
      if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
              message: 'Invalid user ID format',
              success: false
          });
      }
      
      // Fetch logged-in user's details
      const loggedInUser = await User.findById(loggedInUserId);
      if (!loggedInUser) {
          return res.status(StatusCodes.NOT_FOUND).json({ 
              message: 'Logged-in user not found',
              success: false 
          });
      }

      // Build query with gender preferences
      const query = {
          gender: loggedInUser.searchingFor,
          searchingFor: loggedInUser.gender,
          isDelete: 1,
          _id: { $ne: loggedInUserId }
      };

      const users = await User.find(query)
          .select('-password')
          .lean();

      res.status(StatusCodes.OK).json({
          data: users,
          success: true,
          status: StatusCodes.OK,
          message: 'Users fetched successfully based on preferences'
      });

  } catch (error) {
      console.error('Error fetching users by preference:', error);
      
      // Handle CastError specifically
      if (error.name === 'CastError') {
          return res.status(StatusCodes.BAD_REQUEST).json({
              message: "Invalid ID format in request",
              success: false,
              status: StatusCodes.BAD_REQUEST
          });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Server error',
          error: error.message || 'Unknown error',
          success: false,
          status: StatusCodes.INTERNAL_SERVER_ERROR
      });
  }
};

const getAllUserswithProfileMaching = async (req, res) => {
  try {
      const loggedInUserId = req.user.id;
  
      // Validate ObjectID format
      if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid user ID format",
          success: false
        });
      }

      // Get logged-in user's preferences
      const loggedInUser = await User.findById(loggedInUserId);
      if (!loggedInUser) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'Logged-in user not found',
          success: false
        });
      }

      // Get other users with matching preferences
      const users = await User.find({
        _id: { $ne: loggedInUserId },
        gender: loggedInUser.searchingFor,       // Target gender
        searchingFor: loggedInUser.gender         // Should be searching for logged-in user's gender
      })
        .select('-password')
        .lean();

      // Rest of your existing code remains unchanged
      if (users.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'No users found',
          success: false
        });
      }

      // Get match configuration
      const matchWeights = {
        religion: 0.15,
        maritalStatus: 0.1,
        languages: 0.1,
        interestsAndHobbies: 0.1,
        sports: 0.05,
        bodyType: 0.05,
        ethnicity: 0.05,
        education: 0.05,
        smokingHabits: 0.05,
        alcoholFrequency: 0.05,
        wishForChildren: 0.05,
        foodAndDrink: 0.05,
        characterAndTraits: 0.05,
        lifeStyle: 0.05
      };
  
      // Get user details in single query
      const [loggedInDetails, otherDetails] = await Promise.all([
        UserDetails.findOne({ userId: loggedInUserId }).lean(),
        UserDetails.find({ 
          userId: { $in: users.map(u => u._id) }
        }).lean()
      ]);
  
      const detailsMap = new Map(
        otherDetails.map(d => [d.userId.toString(), d])
      );
  
      // Calculate matches
      const usersWithMatches = users.map(user => {
        const userDetails = detailsMap.get(user._id.toString()) || {};
        let matchPercentage = 0;
  
        if (loggedInDetails) {
          let totalScore = 0;
          let totalPossible = 0;
  
          for (const [field, weight] of Object.entries(matchWeights)) {
            const baseVal = loggedInDetails[field];
            const targetVal = userDetails[field];
  
            if (!baseVal || !targetVal) continue;
  
            totalPossible += weight;
  
            if (Array.isArray(baseVal)) {
              const common = baseVal.filter(v => 
                targetVal.includes(v)
              ).length;
              const unique = new Set([...baseVal, ...targetVal]).size;
              totalScore += unique > 0 
                ? (common / unique) * weight 
                : 0;
            } else if (baseVal === targetVal) {
              totalScore += weight;
            }
          }
  
          matchPercentage = totalPossible > 0 
            ? Math.round((totalScore / totalPossible) * 100)
            : 0;
        }
  
        return {
          ...user,
          profileMatch: matchPercentage
        };
      });
  
      // Sort by match percentage
      usersWithMatches.sort((a, b) => b.profileMatch - a.profileMatch);
  
      res.status(StatusCodes.OK).json({
        data: usersWithMatches,
        success: true,
        status: StatusCodes.OK,
        message: 'Users with match percentages fetched successfully'
      });
      
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    
    // Handle CastError specifically
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid ID format",
        success: false,
        status: StatusCodes.BAD_REQUEST
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
      error: error.message,
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
};

module.exports = { createUser, getUserProfile, getAllUsers, updateUserProfile, deleteUser, getMatchingUsers, getUsersByPreference, getAllUserswithProfileMaching }