const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, 
});



module.exports = User;