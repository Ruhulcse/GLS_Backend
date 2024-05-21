const asyncHandler = require("express-async-handler");
const Stripe = require("stripe");

const stripe = new Stripe(
  "sk_test_51MhzlcJggWefJ04ANPv4Gf4MCvQCWWyjeeAWByiT8ncL3FgYbMfQ0HZYoihqDYXIqltVKsBwUFkhaMwyhxbaTeTk002Z92cnlV"
);

// Create stripe
const createStripeSession = asyncHandler(async (req, res) => {
  try {
    const { priceId, email } = req.body;

    console.log(
      "Received request to create Stripe session with price ID:",
      priceId
    );

    let customer = await getOrCreateCustomer(email);

    const hasActiveSubscription = await checkActiveSubscription(customer.id);

    if (hasActiveSubscription) {
      const billingPortalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: "http://localhost:3000/",
      });
      return res.status(409).json({ redirectUrl: billingPortalSession.url });
    }

    const session = await createCheckoutSession(customer.id, priceId, email);

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res
      .status(400)
      .json({ message: "Failed to generate session", error: error.message });
  }
});

const getOrCreateCustomer = async (email) => {
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  } else {
    return await stripe.customers.create({
      email: email,
      metadata: {
        userId: email,
      },
    });
  }
};

const checkActiveSubscription = async (customerId) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  return subscriptions.data.length > 0;
};

const createCheckoutSession = async (customerId, priceId, email) => {
  return await stripe.checkout.sessions.create({
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: email,
    },
    customer: customerId,
  });
};

module.exports = { createStripeSession };
