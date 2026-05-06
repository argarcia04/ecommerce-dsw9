const Product   = require('./Product');
const Order     = require('./Order');
const OrderItem = require('./OrderItem');

Order.hasMany(OrderItem, { foreignKey: 'OrderId',    onDelete: 'CASCADE' });
OrderItem.belongsTo(Order,   { foreignKey: 'OrderId' });

Product.hasMany(OrderItem,  { foreignKey: 'ProductId' });
OrderItem.belongsTo(Product, { foreignKey: 'ProductId' });

module.exports = { Product, Order, OrderItem };