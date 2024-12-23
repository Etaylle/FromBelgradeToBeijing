// api/controllers/order.controller.js
const { Order, OrderItem } = require('../models/order.model'); // Adjust path if needed
const Product = require('../models/product.model');
const { sequelize } = require('../config/db');

exports.createOrder = async (req, res) => {
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
};

exports.getOrders = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const orders = await Order.findAll({
      where: { userId },
      include: [
        { model: OrderItem, include: [Product] }
      ]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};