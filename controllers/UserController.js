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
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, password, height, weight, education, maritalStatus, searchingFor, subscription, ethnicity, childrens, wishForChildren} = req.body;
        const biodata = req.file ? req.file.path : null; // Get the file path from multer

        const requiredFields = [
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password, height, weight, education, maritalStatus, searchingFor, subscription, ethnicity, childrens, wishForChildren
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
            age: age, biodata, height, weight, education, maritalStatus, searchingFor, subscription, ethnicity, childrens, wishForChildren
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
    const updates = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Invalid user ID' 
      });
    }

    // Allowed fields for update
    const allowedUpdates = {
      profileFor: true,
      gender: true,
      firstName: true,
      lastName: true,
      dob: true,
      religion: true,
      motherTongue: true,
      country: true,
      email: true,
      mobile: true,
      profilePhoto: true,
      otherPhotos: true
    };

    // Filter valid updates
    const validUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedUpdates[key]) {
        acc[key] = updates[key];
      }
      return acc;
    }, {});

    // Add update timestamp
    validUpdates.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: validUpdates },
      { 
        new: true,
        runValidators: true,
        projection: { password: 0 } 
      }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        message: 'User not found' 
      });
    }

    res.status(StatusCodes.OK).json({ 
      message: 'User updated successfully', 
      user,
      success: true,
      status: StatusCodes.OK
    });

  } catch (error) {
    console.error('Update error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Server error', 
      error: error.message 
    });
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

const getAllUsersWithProfileMatching = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid user ID format", success: false });
    }

    const [loggedInUser, loggedDetail] = await Promise.all([
      User.findById(loggedInUserId).lean(),
      UserDetails.findOne({ userId: loggedInUserId }).lean()
    ]);

    if (!loggedInUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Logged-in user not found', success: false });
    }

    const {
      page: pageRaw, limit: limitRaw,
      minAge: minAgeRaw, maxAge: maxAgeRaw,
      minHeight: minHeightRaw, maxHeight: maxHeightRaw,
      childrens, wishForChildren, smoking: smokingFilter,
      religion, education
    } = req.query;

    const page = Math.max(parseInt(pageRaw, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const toNumber = (val, parser) => {
      const num = parser(val);
      return (isNaN(num) || num <= 0) ? undefined : num;
    };
    const minAge = toNumber(minAgeRaw, parseInt);
    const maxAge = toNumber(maxAgeRaw, parseInt);
    const minHeight = toNumber(minHeightRaw, parseFloat);
    const maxHeight = toNumber(maxHeightRaw, parseFloat);

    // Build user query
    const userQuery = {
      _id: { $ne: loggedInUserId },
      gender: loggedInUser.searchingFor,
      searchingFor: loggedInUser.gender,
      isDelete: 1
    };

    if (minAge !== undefined || maxAge !== undefined) {
      userQuery.age = {};
      if (minAge !== undefined) userQuery.age.$gte = minAge;
      if (maxAge !== undefined) userQuery.age.$lte = maxAge;
    }
    if (minHeight !== undefined || maxHeight !== undefined) {
      userQuery.height = {};
      if (minHeight !== undefined) userQuery.height.$gte = minHeight;
      if (maxHeight !== undefined) userQuery.height.$lte = maxHeight;
    }
    if (childrens) userQuery.childrens = childrens;
    if (wishForChildren) userQuery.wishForChildren = wishForChildren;
    if (religion) userQuery.religion = religion;
    if (education) userQuery.education = education;

    const users = await User.find(userQuery)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = users.map(u => u._id);
    const detailsList = await UserDetails.find({ userId: { $in: userIds } }).lean();
    const detailsMap = new Map(detailsList.map(d => [d.userId.toString(), d]));

    const weights = {
      religion: 0.15, maritalStatus: 0.1, languages: 0.1, interestsAndHobbies: 0.1,
      sports: 0.05, bodyType: 0.05, ethnicity: 0.05, education: 0.05, smokingHabits: 0.05,
      alcoholFrequency: 0.05, wishForChildren: 0.05, foodAndDrink: 0.05,
      characterAndTraits: 0.05, lifeStyle: 0.05
    };

    const scored = users
      .map(user => {
        const detail = detailsMap.get(user._id.toString());
        if (!detail) return null;

        if (smokingFilter && detail.smokingHabits !== smokingFilter) {
          return null; // Early filter out
        }

        let score = 0, total = 0;
        for (const [field, w] of Object.entries(weights)) {
          const a = loggedDetail?.[field];
          const b = detail?.[field];
          if (!a || !b) continue;
          total += w;

          if (Array.isArray(a) && Array.isArray(b)) {
            const common = a.filter(x => b.includes(x)).length;
            const union = new Set([...a, ...b]).size;
            score += union ? (common / union) * w : 0;
          } else if (a === b) {
            score += w;
          }
        }

        return {
          ...user,
          profileMatch: total ? Math.round((score / total) * 100) : 0
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.profileMatch - a.profileMatch);

    const totalCount = await User.countDocuments(userQuery);

    return res.status(StatusCodes.OK).json({
      data: scored,
      pagination: {
        count: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit
      },
      success: true,
      message: 'Users fetched successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
      success: false,
      error: err.message
    });
  }
};

module.exports = { createUser, getUserProfile, getAllUsers, updateUserProfile, deleteUser, getMatchingUsers, getUsersByPreference, getAllUsersWithProfileMatching }