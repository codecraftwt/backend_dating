const { StatusCodes } = require("http-status-codes");
const Subscriptions = require("../models/subscription");
const SubscriptionPlan = require("../models/subscriptionPlan");

const createCustomer = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: { message: "Email is required" } });
        }

        const customer = await stripe.customers.create({
            email,
        });
        await Subscriptions.create({ email: email, stripeCustomerId: customer.id });
        res.status(StatusCodes.OK).send({ customer });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: { message: "Failed to create customer" } });
    }
};

const createSubscription1 = async (req, res) => {
    try {
        const { customerID, paymentMethodId, priceId } = req.body;
        if (!customerID || !paymentMethodId || !priceId) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: { message: "Customer ID, Payment Method ID, and Price ID are required" } });
        }

        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerID,
        });

        await stripe.customers.update(customerID, {
            invoice_settings: {
                default_payment_method: paymentMethod.id,
            },
        });

        const subscription = await stripe.subscriptions.create({
            customer: customerID,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        res.status(StatusCodes.OK).send(subscription);
    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: { message: "Failed to create subscription" } });
    }
}

const createSubscription = async (req, res) => {
    try {
        const { customerID, paymentMethodId, priceId, userId, planId } = req.body;

        // Validate required fields
        if (!customerID || !paymentMethodId || !priceId || !userId || !planId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                error: { message: "Customer ID, Payment Method ID, Price ID, User ID, and Plan ID are required" },
            });
        }

        // Attach payment method to the customer
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerID,
        });

        // Set the default payment method for the customer
        await stripe.customers.update(customerID, {
            invoice_settings: {
                default_payment_method: paymentMethod.id,
            },
        });

        // Create the subscription in Stripe
        const subscription = await stripe.subscriptions.create({
            customer: customerID,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Calculate subscription end date
        const subscriptionPlan = await SubscriptionPlan.findById(planId);
        if (!subscriptionPlan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                error: { message: "Subscription plan not found" },
            });
        }

        const currentDate = new Date();
        const endDate = new Date(currentDate.setMonth(currentDate.getMonth() + subscriptionPlan.duration));

        // Update the user with the subscription details
        const user = await User.findByIdAndUpdate(
            userId,
            {
                subscription: {
                    plan: planId,
                    endDate: endDate,
                    paymentId: subscription.latest_invoice.payment_intent.id,
                    status: "active",
                },
            },
            { new: true }
        );

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                error: { message: "User not found" },
            });
        }

        // Send the response
        res.status(StatusCodes.OK).send({
            data: { subscription, user },
            message: "Subscription created successfully!!",
            status: StatusCodes.OK,
            success: true,
        });

    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error: { message: "Failed to create subscription" },
        });
    }
};

const createSubscriptionPlan = async (req, res) => {
    try {
        const { name, price, description, duration, features, isActive, currency, trialPeriod } = req.body;

        if (!name || !price || !description || !duration) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: { message: "name, price, description, and duration are required" } });
        }

        const subscriptionPlan = await SubscriptionPlan.create({ name, price, description, duration,features, isActive, currency, trialPeriod });

        res.status(StatusCodes.OK).send(subscriptionPlan);

    } catch (error) {

        console.error("Error creating subscription plan:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: { message: "Failed to create subscription plan" } });

    }
}

const getAllSubscriptionPlans = async (req, res) => {
    try {
        const subscriptionPlans = await SubscriptionPlan.find();

        res.status(StatusCodes.OK).send({
            data: subscriptionPlans, // Array of subscription plans
            message: "Subscription plans fetched successfully!!",
            status: StatusCodes.OK,
            success: true
        });

    } catch (error) {
        console.error("Error fetching subscription plans:", error);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            data: [],
            message: "Failed to fetch subscription plans",
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false
        });
    }
}

module.exports = { createCustomer, createSubscription, createSubscriptionPlan, getAllSubscriptionPlans };