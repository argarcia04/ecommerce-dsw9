// models/OrderItem.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id:       { type: DataTypes.INTEGER,        primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER,        allowNull: false },
  // Precio al momento de la compra (snapshot)
  price:    { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

module.exports = OrderItem;