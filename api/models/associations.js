/*const Cart = require("./Cart");
const CartItem = require("./CartItem");

// Define associations
Cart.hasMany(CartItem, { foreignKey: "cart_id", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

module.exports = { Cart, CartItem };
*/// api/models/associations.js
// api/models/associations.js

// api/models/associations.js

const { Cart, CartItem } = require('./cart.model');
const Product = require('./product.model');
const { Order, OrderItem } = require('./order.model');
const User = require('./user.model');

// Cart Associations
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'cartItems' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

// Order Associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'orderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'orderItemOrder' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// User Associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { Cart, CartItem, Product, Order, OrderItem, User };