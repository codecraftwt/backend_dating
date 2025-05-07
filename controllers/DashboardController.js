const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const UserDetails = require("../models/userDetails");
const dotenv = require('dotenv');
dotenv.config();

const getProfilecompletePercentage = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        const user = await User.findById(userId);
        const userDetails = await UserDetails.findOne({ userId });

        if (!user || !userDetails) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        const profileCompletePercentage = calculateProfileCompletePercentage(user, userDetails);

        res.status(StatusCodes.OK).json({ 
            percent: profileCompletePercentage, 
            message: 'Profile completion percentage fetched successfully', 
            status: StatusCodes.OK, 
            success: true });
    } catch (error) {
        console.error('Error fetching profile completion percentage:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
};

function calculateProfileCompletePercentage(user, userDetails) {
    // Define which fields to count
    const userFields = [
      "profileFor",
      "gender",
      "firstName",
      "lastName",
      "dob",
      "ethnicity",
      "religion",
      "motherTongue",
      "country",
      "email",
      "mobile",
      "age",
      "height",
      "weight",
      "education",
      "maritalStatus",
      "wishForChildren",
      "childrens",
      "searchingFor",
      "designation",
      "profilePhoto",
      // note: you may include otherPhotos, biodata, subscription.status, etc.
    ];
  
    const detailFields = [
      "interestsAndHobbies",
      "sports",
      "travelling",
      "bodyType",
      "ethnicity",
      "languages",
      "smokingHabits",
      "workoutFrequency",
      "alcoholFrequency",
      "maritalStatus",
      "children",
      "religion",
      "profileSummary",
      "foodAndDrink",
      "characterAndTraits",
      "lifeStyle",
    ];
  
    let filled = 0;
    const total = userFields.length + detailFields.length;
  
    // helper to check a field
    const isFilled = (val) => {
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      if (typeof val === "string") {
        return val.trim().length > 0;
      }
      if (typeof val === "number") {
        return !isNaN(val);
      }
      if (val instanceof Date) {
        return true;
      }
      return Boolean(val);
    };
  
    // count user
    for (const key of userFields) {
      if (isFilled(user[key])) {
        filled++;
      }
    }
  
    // count details
    for (const key of detailFields) {
      if (isFilled(userDetails[key])) {
        filled++;
      }
    }
  
    // round to integer percent
    return Math.round((filled / total) * 100);
};

module.exports = { getProfilecompletePercentage };