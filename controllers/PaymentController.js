const { StatusCodes } = require("http-status-codes");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const SubscriptionPlan = require("../models/subscriptionPlan");

/**
 * Create a Payment Intent
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createCheckoutSession = async (req, res) => {
  const { amount, currency, userId, planId } = req.body;
  try {
    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Subscription Plan',
            },
            unit_amount: amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        userId,
        planId,
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

/**
 * Confirm Payment and Update User Subscription
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const confirmPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Extract metadata
    const { userId, planId } = session.metadata;

    // Find the user and plan
    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user || !plan) {
      return res.status(404).json({ error: 'User or plan not found' });
    }

    // Calculate subscription end date
    const currentDate = new Date();
    const endDate = new Date(currentDate.setMonth(currentDate.getMonth() + plan.duration));

    // Update user subscription
    user.subscription = {
      plan: planId,
      endDate,
      paymentId: session.payment_intent,
      status: 'active',
    };

    await user.save();

    res.status(200).json({ message: 'Payment confirmed and subscription updated successfully', user });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

module.exports = { createCheckoutSession, confirmPayment };