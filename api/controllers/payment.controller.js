const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Cart, CartItem } = require('../models/cart.model'); // Import your database models
const Product = require("../models/product.model");
const { Order, OrderItem } = require('../models/order.model');
const crypto = require('crypto');

createCheckoutSession = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['name', 'price', 'image_url'] // Include these product details
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.CartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.Product.name,
          },
          unit_amount: item.Product.price * 100, // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });


    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Add this middleware for raw body parsing
const bodyParser = require('body-parser');

// Webhook route
const webhookHandler = (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// Export the webhook route
module.exports = { createCheckoutSession, webhook: webhookHandler };
