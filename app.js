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
const authenticateSession = require("./api/middleware/authenticateSession"); // Authentication Middleware
const errorHandler = require("./api/middleware/errorHandler"); // Central Error Handler
const { getAllProducts } = require("./api/controllers/product.controller"); // Product Controller
const app = express();
const User = require('./api/models/user.model'); 

// Session store
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("./public"));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    },
  })
);

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

// Swagger Documentation
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Router Setup
const router = express.Router();

// AUTH Routes
router.post("/auth/register", validateUserInput, async (req, res, next) => {
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
        id: newUser.id,
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
    const users = await sequelize.query(
      "SELECT * FROM users WHERE email = ?",
      {
        replacements: [email],
        type: QueryTypes.SELECT,
      }
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Verify the password
    if (!bcrypt.compareSync(password, user.password_hash)) {
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



router.post("/auth/logout", authenticateSession, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

router.get("/auth/currentUser", authenticateSession, (req, res) => {
  res.json(req.session.user);
});

// PRODUCT Routes
router.get("/products", getAllProducts);

// Attach Router to /api
app.use("/api", router);

// Central Error Handling
app.use(errorHandler);

// Server Setup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});

module.exports = app;
