
const { Cart, CartItem } = require('../models/cart.model');
const Product = require("../models/product.model");
const stripe = require('stripe')('sk_test_51QZ5BBGhX6Xc3FUkQsfdKPOpbssz079xH3fDicVXZkWDHC0UBjB8sHOpfRpHHcQIA92j4W9v4TvBrpc2V3UWAI1A00xenr6cN5');
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['name', 'price', 'image_url']
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Calculate total amount
    const totalAmount = cart.CartItems.reduce((sum, item) => 
      sum + (item.quantity * item.Product.price), 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.CartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.Product.name,
          },
          unit_amount: item.Product.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
      metadata: {
        userId: userId,
        cartId: cart.id,
        totalAmount: totalAmount
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send('Webhook signature verification failed');
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle the checkout.session.completed event
      console.log('Received checkout.session.completed event:', event.data);
      break;
    // Handle other event types as needed
    default:
      console.log('Unhandled event type:', event.type);
      break;
  }

  res.sendStatus(200);
};
