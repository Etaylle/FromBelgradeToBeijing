const User = require("../models/user.model"); // Import the User model

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Exclude passwords from the response
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: "An error occurred while fetching users." });
  }
};

// Get current user (assuming you have user authentication middleware setting 'req.user')
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Access user ID from the authenticated user in req.user

    // Find user by primary key and exclude password from the response
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }, // Exclude passwords from the response
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: "An error occurred while fetching the user." });
  }
};

// Export the functions for use in your routes
module.exports = {
  getUsers,
  getCurrentUser,
};
