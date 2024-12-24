// api/controllers/order.controller.js
const { Order, OrderItem } = require('../models/order.model'); // Adjust path if needed
const Product = require('../models/product.model');
const { sequelize } = require('../config/db');
const { createOrder } = require('../services/order.services');
/*exports.createOrder = async (req, res) => {
  const { userId, items } = req.body;

  try {
    // Start a transaction to ensure atomicity
    const t = await sequelize.transaction();

    // Create the order
    const order = await Order.create({ userId, totalAmount: 0 }, { transaction: t });

    let totalAmount = 0;

    // Create order items and update product stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product || product.quantity < item.quantity) {
        throw new Error('Insufficient stock for product');
      }

      const orderItem = await OrderItem.create({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });

      totalAmount += orderItem.price * orderItem.quantity;

      // Update product stock
      product.quantity -= item.quantity;
      await product.save({ transaction: t });
    }

    // Update the order total amount
    order.totalAmount = totalAmount;
    await order.save({ transaction: t });

    // Commit the transaction
    await t.commit();

    res.status(201).json({ message: 'Order created successfully', orderId: order.orderId });
  } catch (error) {
    // Rollback the transaction in case of any error
    await sequelize.transaction().rollback();

    res.status(500).json({ error: 'Failed to create order' });
  }
};*/
/* Create Order
exports.createOrder = async (req, res) => {
  const { userId, items } = req.body;

  // Validate input
  if (!userId || !items || !Array.isArray(items) || !items.every(item => item.productId && item.quantity)) {
      return res.status(400).json({ error: 'Invalid request data' });
  }

  const t = await sequelize.transaction();

  try {
      // Create the order
      const order = await Order.create({ userId, totalAmount: 0 }, { transaction: t });

      // Fetch all products for the order
      const productIds = items.map(item => item.productId);
      const products = await Product.findAll({ where: { id: productIds }, transaction: t });

      const productMap = products.reduce((map, product) => {
          map[product.id] = product;
          return map;
      }, {});

      let totalAmount = 0;

      // Process each item
      for (const item of items) {
          const product = productMap[item.productId];

          if (!product) {
              throw new Error(`Product with ID ${item.productId} not found`);
          }

          if (product.quantity < item.quantity) {
              throw new Error(`Insufficient stock for product ID ${item.productId}`);
          }

          // Create order item
          const orderItem = await OrderItem.create({
              orderId: order.orderId,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price
          }, { transaction: t });

          totalAmount += orderItem.price * orderItem.quantity;

          // Update product stock
          product.quantity -= item.quantity;
          await product.save({ transaction: t });
      }

      // Update order total amount
      order.totalAmount = totalAmount;
      await order.save({ transaction: t });

      // Commit the transaction
      await t.commit();

      res.status(201).json({ message: 'Order created successfully', orderId: order.orderId });
  } catch (error) {
      await t.rollback();
      console.error('Order creation failed:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
  }
};
*/// Create Order
exports.createOrder = async (req, res) => {
  const { userId, items } = req.body;

  // Validate input
  if (!userId || !items) {
      return res.status(400).json({ error: 'Invalid request data' });
  }

  const t = await sequelize.transaction();

  try {
      const order = await createOrder(userId, items, t);  // Use the shared logic
      await t.commit();
      res.status(201).json({ message: 'Order created successfully', orderId: order.orderId });
  } catch (error) {
      await t.rollback();
      console.error('Order creation failed:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  const userId = req.session.user.id;

  try {
      const orders = await Order.findAll({
          where: { userId },
          include: [
              { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
          ]
      });

      res.json(orders);
  } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
  }
};