const { StatusCodes } = require("http-status-codes");
const Subscriptions = require("../models/subscription");

const createCustomer = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).send({ error: { message: "Email is required" } });
        }

        const customer = await stripe.customers.create({
            email,
        });

        res.status(StatusCodes.OK).send({ customer });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: { message: "Failed to create customer" } });
    }
};

const createSubscription = async (req, res) => {
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

module.exports = { createCustomer, createSubscription };