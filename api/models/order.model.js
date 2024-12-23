// api/models/order.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Define Order model
const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders'
});

// Define OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  orderItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cartItemId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items'
});

// Associate Order with OrderItem
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});

// Associate OrderItem with Order
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Export Order and OrderItem models
module.exports = { Order, OrderItem };