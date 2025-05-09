const User = require("../models/user");
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');
dotenv.config();

const checkSubscription = (requiredPlans) => {
  return async (req, res, next) => {    
    try {      
      const user = await User.findById(req.user.id).exec();
        
      if (!user || !user.subscription || !user.subscriptionPlan) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "No active subscription" });
      }

      // Check plan name and active status
      if (
        user.subscription.status !== 'active' || !requiredPlans.includes(user.subscriptionPlan)
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({ isSubscriptionError: true, subscriptionType: 'InActive or Insufficient', message: "Insufficient subscription tier" });
      }

      // Check expiration
      if (new Date(user.subscription.endDate) < new Date()) {
        user.subscription.status = 'inactive';
        await user.save();
        return res.status(StatusCodes.FORBIDDEN).json({isSubscriptionError: true, subscriptionType: 'Plan expired',  message: "Subscription expired" });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  };
};

module.exports = checkSubscription;
