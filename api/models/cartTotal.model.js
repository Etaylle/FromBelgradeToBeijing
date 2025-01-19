const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CartTotal = sequelize.define('CartTotal', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  total_items: DataTypes.INTEGER,
  total_price: DataTypes.DECIMAL(10, 2)
}, {
  tableName: 'cart_totals',
  timestamps: false
});

module.exports = CartTotal;