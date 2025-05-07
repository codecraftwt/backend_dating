const express = require('express');
const { createCustomer, createSubscription, createSubscriptionPlan, getAllSubscriptionPlans, getSubscriptionStatus} = require('../controllers/SubscriptionController');
const router = express.Router();

// Route to create a customer
router.post("/create-customer", createCustomer);

// Route to create a subscription
router.post("/create-subscription", createSubscription);

// to get all subscription plans
router.get("/subscriptionPlans", getAllSubscriptionPlans);

// to get all subscription plans
router.get("/check-subscription", getSubscriptionStatus);

// to post subscription plan
router.post("/create-subscriptionPlan", createSubscriptionPlan);

module.exports = router;