const { sequelize } = require('../config/db'); // Import the sequelize instance from db.js
const { DataTypes } = require('sequelize'); // Import DataTypes from Sequelize

const Product = sequelize.define("Product", {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "product_id" // Map to the actual column name in the database
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "category_id" // Ensure the correct column name is used here too
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: true,  // Ensure Sequelize automatically adds createdAt and updatedAt fields
});

module.exports = Product;