const stripe = require('stripe')('sk_test_51QZ5BBGhX6Xc3FUkQsfdKPOpbssz079xH3fDicVXZkWDHC0UBjB8sHOpfRpHHcQIA92j4W9v4TvBrpc2V3UWAI1A00xenr6cN5');
const { sequelize } = require('../config/db');
const { Order } = require('../models/order.model');
const crypto = require('crypto');
const endpointSecret = "whsec_SEH6R40s7j1Kctrkut02KL9xUYjwTrRB";


const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    console.log('Webhook received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const totalAmount = session.amount_total / 100; // Convert from cents to dollars

      // Process the order based on the session data
      await sequelize.transaction(async (t) => {
        const order = await Order.create(
          {
            user_id: userId,
            total_amount: totalAmount,
            status: 'delivered',
            payment_status: session.payment_status,
            stripe_session_id: session.id,
            customer_email: session.customer_details.email,
            customer_name: session.customer_details.name,
          },
          { transaction: t }
        );
      });

      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = webhookHandler;
/*
const webhookHandler = async (req, res) => {
const sig = req.headers['stripe-signature'];
   

    let event;

    try {
        // Use req.body directly as raw data
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            endpointSecret
        );

        console.log('Webhook received:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            try {
                // Process the order based on the session
                await sequelize.transaction(async (t) => {
                    const order = await Order.create(
                        {
                            id: crypto.randomUUID(),
                            user_id: session.metadata.userId,
                            total_amount: session.amount_total / 100,
                            status: 'completed',
                            payment_status: session.payment_status,
                            stripe_session_id: session.id,
                            customer_email: session.customer_details.email,
                            customer_name: session.customer_details.name,
                        },
                        { transaction: t }
                    );

                    // Additional logic for cart, order items, etc.
                });

                res.json({ received: true, status: 'success' });
            } catch (error) {
                console.error('Order processing error:', error);
                res.json({ received: true, status: 'error', message: error.message });
            }
        } else {
            console.log(`Unhandled event type: ${event.type}`);
            res.json({ received: true });
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

module.exports = webhookHandler;*/
