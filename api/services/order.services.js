/*
/*const { Order, OrderItem } = require('../models/order.model');
const { Product } = require('../models/product.model');

async function handleCheckoutSessionCompleted(event) {
    const session = event.data.object;
    
    // Extract relevant data from the session
    const userId = session.metadata.userId;  // User ID from metadata
    const totalAmount = parseFloat(session.metadata.totalAmount);  // Total amount from metadata
    const cartItems = JSON.parse(session.metadata.cartItems);  // Cart items from metadata

    // Create the order using the extracted data
    const order = await createOrder(userId, cartItems);

    // Update the order's total amount after all items are processed
    order.totalAmount = totalAmount;
    await order.save();

    console.log(`Order created: ${order.order_id} with total amount: ${totalAmount}`);
}
const { sequelize } = require('../config/db');
const { Order, OrderItem } = require('../models/order.model');
const { Product } = require('../models/product.model');

async function handleCheckoutSessionCompleted(event) {
    const session = event.data.object;
    
    // Extract relevant data from the session
    const userId = session.metadata.userId;  // User ID from metadata
    const totalAmount = parseFloat(session.metadata.totalAmount);  // Total amount from metadata
    const cartItems = JSON.parse(session.metadata.cartItems);  // Cart items from metadata

    // Create the order using the extracted data
    const order = await createOrder(userId, cartItems);

    // Update the order's total amount after all items are processed
    order.totalAmount = totalAmount;
    await order.save();

    console.log(`Order created: ${order.order_id} with total amount: ${totalAmount}`);
}
async function createOrder(userId, items, t = null) {
    if (!Array.isArray(items) || !items.every(item => item.productId && item.quantity)) {
      throw new Error('Invalid items data');
    }
  
    // Fetch all products for the order
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({ where: { product_id: productIds }, transaction: t });
  
    const productMap = products.reduce((map, product) => {
      map[product.product_id] = product;
      return map;
    }, {});
  
    let totalAmount = 0;
  
    // Process each item
    for (const item of items) {
      const product = productMap[item.productId];
  
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
  
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }
  
      // Calculate the item's total price
      const itemTotalPrice = product.price * item.quantity;
  
      // Add the item's total price to the total amount
      totalAmount += itemTotalPrice;
  
      // Create order item
      const orderItem = await OrderItem.create({
        orderId: null,  // Set orderId to null initially
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });
  
      // Update product stock
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }
  
    // Create the order with the calculated total amount
    const order = await Order.create({ 
      userId, 
      totalAmount  // Set the correct totalAmount
    }, { transaction: t });
  
    // Update the order's orderId in the order items
    const orderItems = await OrderItem.findAll({ where: { orderId: null }, transaction: t });
    for (const orderItem of orderItems) {
      orderItem.orderId = order.order_id;
      await orderItem.save({ transaction: t });
    }
  
    return order;
  }/*async function createOrder(userId, items, t = null) {
    if (!Array.isArray(items) || !items.every(item => item.productId && item.quantity)) {
      throw new Error('Invalid items data');
    }
  
    // Fetch all products for the order
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({ where: { product_id: productIds }, transaction: t });
  
    const productMap = products.reduce((map, product) => {
      map[product.product_id] = product;
      return map;
    }, {});
  
    let totalAmount = 0;
  
    // Process each item
    for (const item of items) {
      const product = productMap[item.productId];
  
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
  
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }
  
      // Calculate the item's total price
      const itemTotalPrice = product.price * item.quantity;
  
      // Add the item's total price to the total amount
      totalAmount += itemTotalPrice;
  
      // Create order item
      const orderItem = await OrderItem.create({
        orderId: null,  // Set orderId to null initially
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });
  
      // Update product stock
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }
  
    // Create the order with the calculated total amount
    const order = await Order.create({ 
      userId, 
      totalAmount  // Set the correct totalAmount
    }, { transaction: t });
  
    // Update the order's orderId in the order items
    console.log(OrderItem);
    const orderItems = await OrderItem.findAll({ where: { orderId: null }, transaction: t });
    console.log(orderItems);
    for (const orderItem of orderItems) {
      orderItem.orderId = order.order_id;
      await orderItem.save({ transaction: t });
    }
  
    return order;
  }

module.exports = { handleCheckoutSessionCompleted,createOrder };
*/const { Order, OrderItem, Product } = require('../models/associations');
const { sequelize } = require('../config/db');
async function handleCheckoutSessionCompleted(event) {
  const session = event.data.object;

  // Validate metadata existence and format
  if (!session.metadata) {
    throw new Error('Session metadata is missing');
  }

  const userId = session.metadata.userId;
  const cartItemsRaw = session.metadata.cartItems;
  const totalAmountRaw = session.metadata.totalAmount;

  if (!userId || !cartItemsRaw || !totalAmountRaw) {
    throw new Error('Invalid session metadata: userId, cartItems, or totalAmount is missing');
  }

  const totalAmount = parseFloat(totalAmountRaw);
  if (isNaN(totalAmount)) {
    throw new Error(`Invalid totalAmount in metadata: ${totalAmountRaw}`);
  }

  const cartItems = JSON.parse(cartItemsRaw);
  if (!Array.isArray(cartItems) || !cartItems.every(item => item.productId && item.quantity > 0)) {
    throw new Error('Invalid cartItems in metadata');
  }

  console.log('Metadata Validation Passed');
  console.log(`userId: ${userId}, totalAmount: ${totalAmount}, cartItems:`, cartItems);

  // Proceed to create order
  const order = await createOrder(userId, cartItems, totalAmount);

  console.log(`Order created successfully: ${order.order_id} with total amount: ${totalAmount}`);
}

/*



 async function handleCheckoutSessionCompleted(event) {
   const session = event.data.object;

   // Extract relevant data from the session
   const userId = session.metadata.userId;  // User ID from metadata
   const totalAmount = parseFloat(session.metadata.totalAmount);  // Total amount from metadata
   const cartItems = JSON.parse(session.metadata.cartItems);  // Cart items from metadata

   // Create the order using the extracted data
   const order = await createOrder(userId, cartItems, totalAmount);
   
   
   await order.save();
   console.log(`Order created: ${order.order_id} with total amount: ${totalAmount}`);
 }

 async function createOrder(userId, cartItems, totalAmount, t = null) {
   if (!Array.isArray(cartItems) || !cartItems.every(item => item.productId && item.quantity)) {
     throw new Error('Invalid cartItems data');
   }

   console.log('Cart Items:', cartItems);

   const productIds = cartItems.map(item => item.productId);
   const products = await Product.findAll({ where: { product_id: productIds }, transaction: t });

   console.log('Fetched Products:', products);

   const productMap = products.reduce((map, product) => {
     const formattedPrice = parseFloat(product.price);
     if (!formattedPrice || isNaN(formattedPrice)) {
       console.error(`Error: Invalid price for product ID ${product.product_id}`);
       throw new Error(`Invalid price for product ID: ${product.product_id}`);
     }

     map[product.product_id] = {
       ...product.dataValues,
       price: formattedPrice,
     };
     return map;
   }, {});

   console.log('Product Map:', productMap);

   const order = await Order.create({
     user_id: userId,
     total_amount: totalAmount,
   }, { transaction: t });

   for (const item of cartItems) {
    const product = productMap[item.productId];
    if (!product) {
      console.error(`Error: Product not found for product ID ${item.productId}`);
      throw new Error(`Product not found for product ID: ${item.productId}`);
    }
  
    if (!product.price || isNaN(product.price)) {
      console.error(`Error: Invalid price for product ID ${product.product_id}`);
      throw new Error(`Invalid price for product ID: ${product.product_id}`);
    }
  
    console.log('Creating OrderItem with data:', {
      order_id: order.order_id,
      product_id: item.productId,
      quantity: item.quantity,
      price: product.price,
    });
  
    await OrderItem.create({
      order_id: order.order_id,
      product_id: item.productId,
      quantity: item.quantity,
      price: product.price,
    }, { transaction: t });
  
    // Update stock
    product.stock -= item.quantity;
    await Product.update(
      { stock: sequelize.literal(`stock - ${item.quantity}`) },
      { where: { product_id: item.productId }, transaction: t }
    );
  }
  

   return order;
 }
*/
async function createOrder(userId, cartItems, totalAmount, t = null) {
  if (!Array.isArray(cartItems) || !cartItems.every(item => item.productId && item.quantity > 0)) {
    throw new Error('Invalid cartItems data');
  }

  console.log('Cart Items:', cartItems);

  const productIds = cartItems.map(item => item.productId);
  const products = await Product.findAll({ where: { product_id: productIds }, transaction: t });

  console.log('Fetched Products:', products);

  const productMap = products.reduce((map, product) => {
    map[product.product_id] = { ...product.dataValues };
    return map;
  }, {});

  console.log('Product Map:', productMap);

  // Create the order with the passed totalAmount
  const order = await Order.create({
    user_id: userId,
    total_amount: totalAmount, // Use the passed totalAmount
  }, { transaction: t });

  for (const item of cartItems) {
    const product = productMap[item.productId];
    if (!product) {
      console.error(`Error: Product not found for product ID ${item.productId}`);
      throw new Error(`Product not found for product ID: ${item.productId}`);
    }

    console.log('Creating OrderItem with data:', {
      order_id: order.order_id,
      product_id: item.productId,
      quantity: item.quantity,
      price: product.price,
    });

    await OrderItem.create({
      order_id: order.order_id,
      product_id: item.productId,
      quantity: item.quantity,
      price: product.price,
    }, { transaction: t });

    // Update stock
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ID: ${item.productId}`);
    }
    await Product.update(
      { stock: sequelize.literal(`stock - ${item.quantity}`) },
      { where: { product_id: item.productId }, transaction: t }
    );
  }

  console.log('Final Order:', order);

  return order;
}

 module.exports = { handleCheckoutSessionCompleted, createOrder };