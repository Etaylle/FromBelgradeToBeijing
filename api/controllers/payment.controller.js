const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Cart, CartItem } = require('../models/cart.model'); // Import your database models
const Product = require("../models/product.model");
const { Order } = require('../models/order.model');


exports.createCheckoutSession = async (req, res) => {
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

