// models/user.js (or wherever your user model is)
const { sequelize } = require('../config/db'); // Import the sequelize instance from db.js
const { DataTypes } = require('sequelize'); // Make sure you're using the correct Sequelize instance.

const User = sequelize.define('User', {
  user_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password_hash: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer' 
  },
  firstname: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  lastname: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  credits: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0
  },
}, {
  tableName: 'users', // Make sure to match the actual table name.
  timestamps: true,
  createdAt: 'created_at', // Map Sequelize's `createdAt` to your DB's `created_at`
  updatedAt: false, 
});

module.exports = User;
/*const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50],
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
    allowNull: false,
  },
  
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// Hooks
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

module.exports = User;
/*const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password_hash: { // Update field name to match your controller
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Hash password before saving the user
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

module.exports = User;*/