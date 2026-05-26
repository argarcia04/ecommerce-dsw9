// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING },
  store_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'stores', key: 'id' } }
  
});

module.exports = Product;
