const express = require('express');
const { createCustomer, createSubscription} = require('../controllers/SubscriptionController');
const router = express.Router();

// Route to create a customer
router.post("/create-customer", createCustomer);

// Route to create a subscription
router.post("/create-subscription", createSubscription);

module.exports = router;