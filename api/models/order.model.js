// api/models/order.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Define Order model
const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'delivered'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
},
 {
  tableName: 'orders'
});

// Define OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  
  },
 
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'order_items',
});

// Associate Order with OrderItem
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

// Associate OrderItem with Order
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// Export Order and OrderItem models
module.exports = { Order, OrderItem };