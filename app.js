require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { connectDB, sequelize } = require("./api/config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");
const validateUserInput = require("./api/middleware/validation"); // Validation Middleware
//const {authenticateSession, populateUser} = require("./api/middleware/authenticateSession"); // Authentication Middleware
const errorHandler = require("./api/middleware/errorHandler"); // Central Error Handler
const { getAllProducts } = require("./api/controllers/product.controller"); // Product Controller
const app = express();
const User = require('./api/models/user.model'); 
const path = require('path');


// Session store
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("./public"));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false, // Do not save session if it hasn't changed
    saveUninitialized: false, // Do not create session until something is stored
    cookie: {
      httpOnly: true,
      secure: false, // Keep false for school project over HTTP
      maxAge: 86400000, // 1 day
    },
  })
);
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use(express.static(path.join(__dirname, 'public')));

// Sync database and session store
(async () => {
  try {
    await connectDB();
    await sessionStore.sync();
    await sequelize.sync({ alter: true });
    console.log("Database and session store synced successfully!");
  } catch (error) {
    console.error("Error syncing database or session store:", error);
  }
})();

const { Product } = require('./api/models/product.model'); // Make sure your Sequelize model is correctly imported

/*app.get('/api/products', async (req, res) => {
  try {
    // Fetch all products using Sequelize
    const products = await Product.findAll(); // Assuming 'Product' is your Sequelize model

    // Map the products to process image URLs
    const mappedProducts = products.map(product => {
      let imageUrls;

      if (product.image_url) {
        // Handle multiple or single URLs
        imageUrls = product.image_url.includes(',')
          ? product.image_url.split(',').map(url => url.trim()) // Split and clean
          : [product.image_url]; // Wrap single URL in an array
      } else {
        imageUrls = []; // Default to an empty array if no URLs
      }

      return {
        ...product.toJSON(), // Convert Sequelize model instance to plain object
        images: imageUrls.map(image => `/images/${image}`), // Prefix static path
      };
    });

    res.json(mappedProducts); // Send the processed products
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching products from the database...');
    const [products] = await db.query('SELECT * FROM products', { type: QueryTypes.SELECT });

    const mappedProducts = products.map(product => {
      let imageUrls;
      if (product.image_url) {
        // Check if the image_url contains multiple URLs
        imageUrls = product.image_url.includes(',')
          ? product.image_url.split(',').map(url => url.trim()) // Split and trim
          : [product.image_url]; // Single URL
      } else {
        imageUrls = []; 
      }

      return {
        ...product,
        images: imageUrls.map(image => `/images/${image}`), // Map URLs to static path
      };
    });

    res.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

*/
// Swagger Documentation
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Router Setup
const router = express.Router();

// AUTH Routes
router.post("/auth/register", async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;

    const [existingUser, existingUsername] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { username } }),
    ]);

    if (existingUser || existingUsername) {
      return res.status(400).json({ message: 'Email or username is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ password, hashedPassword });

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      firstname,
      lastname,
      credits: 0,
      role: 'customer',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.user_id, // Use user_id here
        username: newUser.username,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
      },
    });
  } catch (err) {
    next(err);
  }
});


router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Execute the query to fetch the user
    const users = await User.findOne({ where: { email } });
if (!user) {
  return res.status(400).json({ message: "Invalid credentials" });
}


    // Check if the user exists
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Set session data
    req.session.user = {
      id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      address: user.address,
      role: user.role,
    };

    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    next(err); // Pass error to the central error handler
  }
});



router.post("/auth/logout",  (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

router.get("/auth/currentUser", (req, res) => {
  res.json(req.session.user);
});

// PRODUCT Routes
router.get("/products", getAllProducts);

// Attach Router to /api
app.use("/api", router);
app.use(express.static('public'));
// Central Error Handling
app.use(errorHandler);
app.use('/images', express.static('public/images'));
// Server Setup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});

module.exports = app;
