const { Cart, CartItem } = require('../models/cart.model');
const Product = require('../models/product.model');
const sequelize = require('../config/db');
const { CartTotal } = require('../models/cartTotal.model');
exports.addToCart = async (req, res) => {
  try {
    console.log('Adding to cart, request body:', req.body);
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;
    console.log('User ID:', userId);

    let cart = await Cart.findOne({ where: { user_id: userId, status: 'active' } });
    console.log('Existing cart:', cart);

    if (!cart) {
      cart = await Cart.create({ user_id: userId, status: 'active' });
    }
    const product = await Product.findByPk(productId);
    console.log('Product:', product);

    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id: productId }
    });
    console.log('Existing cart item:', cartItem);

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price_at_time = product.price;
      await cartItem.save();
      console.log('Updated cart item:', cartItem);
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity: quantity,
        price_at_time: product.price
      });
      console.log('New cart item created:', cartItem);
    }

    res.status(200).json({ message: 'Product added to cart', cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          attributes: ['name', 'price', 'image_url'] // Include these product details
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Calculate the total
    let total = 0;
    cart.CartItems.forEach(item => {
      total += item.quantity * item.Product.price;
    });

    res.status(200).json({ 
      cart: {
        items: cart.CartItems.map(item => ({
          product_id: item.product_id,
          name: item.Product.name,
          price: item.Product.price,
          quantity: item.quantity,
          image_url: item.Product.image_url
        })),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

exports.getCartTotals = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [totals] = await CartTotal.findAll({
      where: { user_id: userId }
    });

    if (!totals) {
      return res.status(404).json({ message: 'Cart totals not found' });
    }

    res.status(200).json({ message: 'Cart totals retrieved successfully', data: totals });
  } catch (error) {
    console.error('Error fetching cart totals:', error);
    res.status(500).json({ message: 'Failed to fetch cart totals', error: error.message });
  }
};
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ where: { user_id: userId, status: 'active' } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id: productId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item updated', cartItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ where: { user_id: userId, status: 'active' } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id: productId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();

    res.status(200).json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

exports.getCartDetails = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [results] = await sequelize.query(
      'CALL get_cart_details(:userId)',
      {
        replacements: { userId }
      }
    );
    res.status(200).json({ cartDetails: results });
  } catch (error) {
    console.error('Error getting cart details:', error);
    res.status(500).json({ message: 'Error getting cart details', error: error.message });
  }
};

exports.cleanupCarts = async (req, res) => {
  try {
    const { daysOld } = req.body;
    await sequelize.query(
      'CALL cleanup_abandoned_carts(:days)',
      {
        replacements: { days: daysOld }
      }
    );
    res.status(200).json({ message: 'Abandoned carts cleaned up successfully' });
  } catch (error) {
    console.error('Error cleaning up carts:', error);
    res.status(500).json({ message: 'Error cleaning up carts', error: error.message });
  }
};