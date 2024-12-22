const Cart = require("./Cart");
const CartItem = require("./CartItem");

// Define associations
Cart.hasMany(CartItem, { foreignKey: "cart_id", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

module.exports = { Cart, CartItem };
