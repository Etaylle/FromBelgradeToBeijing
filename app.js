// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { connectDB, sequelize } = require('./api/config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const { Cart, CartItem } = require('./api/models/cart.model');
const { callProcedure } = require('./api/config/db');
const {
  authenticateSession,
  validateRegisterInput,
  validateLoginInput
} = require('./api/middleware/auth.middleware');
const errorHandler = require('./api/middleware/error.middleware');
const User = require('./api/models/user.model');
const { Product } = require('./api/models/product.model');
const { getAllProducts } = require("./api/controllers/product.controller");
const { getCurrentUser, getUsers } = require('./api/controllers/user.controller');
const cartController = require('./api/controllers/cart.controller');
const paymentController = require('./api/controllers/payment.controller');
const { Order, OrderItem } = require('./api/models/order.model');
const app = express();
const stripe = require('stripe')('sk_test_51QZ5BBGhX6Xc3FUkQsfdKPOpbssz079xH3fDicVXZkWDHC0UBjB8sHOpfRpHHcQIA92j4W9v4TvBrpc2V3UWAI1A00xenr6cN5');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookHandler = require('./api/middleware/webhookHandler.js');
const { handleCheckoutSessionCompleted,createOrder } = require('./api/services/order.services');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions', // Matches your database table name
});

(async () => {
  try {
    if (sessionStore.sync) {
      await sessionStore.sync();
      console.log('Session store synced successfully');
    } else {
      console.error('Session store sync method is not defined');
    }
  } catch (error) {
    console.error('Error syncing session store:', error);
  }
})();

app.use(session({
  secret: process.env.SESSION_SECRET || 'odBeogradaDoTokija',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
// Webhook route: Use raw body parsing
/*app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Pass the raw body to Stripe's constructEvent
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    console.log('Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Extract metadata
        const { userId, cartItems } = session.metadata;

        let items = [];
        try {
          items = JSON.parse(cartItems);
        } catch (error) {
          console.error('Invalid cartItems format:', error);
          return res.status(400).send('Invalid cartItems format');
        }

        // Create the order using the shared logic
        const order = await createOrder(userId, items);  // Use the shared logic
        console.log('Order created successfully:', order);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});*/

/*app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }), // Parse raw body for Stripe
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Pass the raw body to Stripe's constructEvent
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
      console.log('Webhook received:', event.type);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Checkout session completed:', session);
          // Add logic to process the session, e.g., create an order
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      
  
      try {
        const session = event.data.object;
  
      // Extract metadata
      const { userId, totalAmount, cartItems } = session.metadata;
        // Create the Order in Sequelize
        const order = await Order.create({
          user_id: userId,
          total_amount: totalAmount,
          status: 'delivered',
        });
  
        // Create OrderItems
        const items = JSON.parse(cartItems).map(item => ({
          order_id: order.order_id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));
  
        await OrderItem.bulkCreate(items);
  
        console.log('Order created successfully:', order);
        res.status(200).send('Order processed');
      } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  });
*/
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Pass the raw body to Stripe's constructEvent
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    console.log('Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        try {
          const session = event.data.object;

          // Extract metadata and parse cartItems
          const { userId, cartItems } = session.metadata;
          
          let items = [];
          try {
            items = JSON.parse(cartItems);  // Ensure this is correctly parsed
          } catch (error) {
            console.error('Invalid cartItems format:', error);
            return res.status(400).send('Invalid cartItems format');
          }

          // Validate the items format (check for productId and quantity)
          if (!Array.isArray(items) || !items.every(item => item.productId && item.quantity)) {
            console.error('Invalid items data:', items);
            return res.status(400).send('Invalid items data');
          }

          // Create the order using the shared logic
          const order = await createOrder(userId, items);  // Call the shared logic
          console.log('Order created successfully:', order);
        } catch (err) {
          console.error('Error during order creation:', err.message);
          return res.status(500).send('Error during order creation');
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
// Other routes
app.use(express.json()); // Parse JSON for non-webhook routes

// Use the controller
app.get('/api/products', getAllProducts);
// Protected routes - require authentication
app.get('/api/users/current', authenticateSession, getCurrentUser);
app.get('/api/users/all', authenticateSession, getUsers);

// Cart routes
app.post('/api/cart/add', authenticateSession, cartController.addToCart);
app.get('/api/cart', authenticateSession, cartController.getCart);

app.delete('/api/cart/remove', authenticateSession, cartController.removeFromCart);
// Route to fetch cart details using the stored procedure
app.get('/api/cart/:userId/details', authenticateSession, async (req, res) => {
  const userId = req.params.userId;
  try {
    const cartDetails = await callProcedure('get_cart_details', { p_user_id: userId });
    res.status(200).json(cartDetails);
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ error: 'Failed to fetch cart details' });
  }
});

// Route to fetch cart totals using the view
app.get('/api/cart/:userId/totals', authenticateSession, async (req, res) => {
  const userId = req.params.userId;
  try {
    const [totals] = await sequelize.query(
      'SELECT * FROM cart_totals WHERE user_id = :userId',
      { replacements: { userId } }
    );
    res.status(200).json(totals);
  } catch (error) {
    console.error('Error fetching cart totals:', error);
    res.status(500).json({ error: 'Failed to fetch cart totals' });
  }
});
app.post('/api/create-checkout-session', authenticateSession, paymentController.createCheckoutSession);
// Auth Routes
app.post('/api/auth/register', validateRegisterInput, async (req, res, next) => {
  try {
    const { username, email, password, firstname, lastname } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      firstname,
      lastname,
      role: 'customer',
      credits: 0
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    next(error);
  }
})


app.post('/api/auth/login', validateLoginInput, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }});

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', authenticateSession, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', authenticateSession, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});


// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize database
  connectDB()
  .then(async () => {

    if (sessionStore.sync) {
    await sessionStore.sync();
    console.log('Session store synced');
    }else{
      console.log('Session store not synced');
    }
    console.log('Session Store:', sessionStore);
    await Cart.sync();
    await CartItem.sync();
    console.log('Database connected and models synced');
  }).catch(error => {
    console.error('Database connection error:', error);
  });
});
sequelize.options.logging = console.log;
module.exports = app;