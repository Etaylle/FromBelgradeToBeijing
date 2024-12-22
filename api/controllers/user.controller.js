// api/controllers/user.controller.js
const User = require("../models/user.model");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }, // Exclude password_hash from the response
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching users." });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.session.user.id; // Access user ID from the session

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }, // Exclude password_hash from the response
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the user." });
  }
};

module.exports = {
  getUsers,
  getCurrentUser,
};