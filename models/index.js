const sequelize = require('../config/database');
const Product   = require('./Product');
const Order     = require('./Order');
const OrderItem = require('./OrderItem');
const Store     = require('./Store');
const User      = require('./User');
const Wishlist  = require('./Wishlist');

Order.hasMany(OrderItem,    { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order,  { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product,{ foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem,  { foreignKey: 'product_id' });

// Store <-> Product
Store.hasMany(Product,    { foreignKey: 'store_id', as: 'products' });
Product.belongsTo(Store,  { foreignKey: 'store_id', as: 'store' });

// Store <-> OrderItem (para calcular ventas por tienda)
Store.hasMany(OrderItem,  { foreignKey: 'store_id', as: 'orderItems' });
OrderItem.belongsTo(Store,{ foreignKey: 'store_id', as: 'store' });

// User <-> Order
User.hasMany(Order,    { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User,  { foreignKey: 'user_id', as: 'user' });

// User <-> Product (via Wishlist)
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'user_id',    as: 'wishlistProducts' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'product_id', as: 'wishedByUsers' });

Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Wishlist.belongsTo(User,    { foreignKey: 'user_id',    as: 'user' });

sequelize.sync({ alter: true })
  .then(() => console.log('Tablas sincronizadas'))
  .catch(err => console.error('Error sync:', err));

module.exports = { Product, Order, OrderItem, Store, User, Wishlist };