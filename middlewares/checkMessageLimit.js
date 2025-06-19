const User    = require("../models/user");
const { StatusCodes } = require('http-status-codes');
const Message = require('../models/messageNew');
const Room = require("../models/roomNew");

const DAILY_LIMIT = 5;

module.exports = async function checkMessageLimit(req, res, next) {
  try {
    // 1) load fresh user record (with subscription fields)
    const user = await User.findById(req.user.id).exec();

    if (!user || !user.subscription || !user.subscriptionPlan) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "No active subscription" });
    }

    // 2) ensure their subscription is still active
    if (user.subscription.status !== "active") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Subscription inactive" });
    }

    // 3) only Free users are limited
    if (user.subscriptionPlan !== "free") {
      return next();
    }

    // 4) compute today’s window (midnight → midnight)
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // 5. Fetch rooms where the user has sent messages
    const rooms = await Room.find({ "chat.senderId": user._id }, "chat").lean();

    let sentToday = 0;

    for (const room of rooms) {
      for (const msg of room.chat) {
        if (
          msg.senderId === user._id.toString() &&
          new Date(msg.timestamp) >= startOfDay &&
          new Date(msg.timestamp) < endOfDay
        ) {
          sentToday++;
          if (sentToday >= DAILY_LIMIT) break;
        }
      }
      if (sentToday >= DAILY_LIMIT) break;
    }
    if (sentToday >= DAILY_LIMIT) {
      return res
        .status(StatusCodes.TOO_MANY_REQUESTS)
        .json({
          message:           `Free plan daily limit of ${DAILY_LIMIT} reached.`,
          isSubscriptionError: true,
          subscriptionType:    "Free"
        });
    }

    // 6) all good!
    next();
  } catch (err) {
    console.error("Message limit check failed:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};