const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');
dotenv.config();


const checkSubscription = (requiredPlan) => {
    return async (req, res, next) => {
      try {
        const user = await User.findById(req.user._id)
          .populate('subscription.plan')
          .exec();
  
        if (!user.subscription.plan) {
          return res.status(403).json({ message: "No active subscription" });
        }
  
        // Check plan validity
        if (user.subscription.status !== 'active' || 
            user.subscription.plan.name !== requiredPlan) {
          return res.status(403).json({ message: "Insufficient subscription tier" });
        }
  
        // Check expiration
        if (user.subscription.endDate < Date.now()) {
          user.subscription.status = 'inactive';
          await user.save();
          return res.status(403).json({ message: "Subscription expired" });
        }
  
        next();
      } catch (error) {
        next(error);
      }
    };
  };

  module.exports = checkSubscription