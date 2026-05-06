const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Order = sequelize.define('Order', {
  id:        { type: DataTypes.INTEGER,        primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING,         allowNull: false },
  lastName:  { type: DataTypes.STRING,         allowNull: false },
  email:     { type: DataTypes.STRING,         allowNull: false },
  address:   { type: DataTypes.STRING,         allowNull: false },
  city:      { type: DataTypes.STRING,         allowNull: false },
  province:  { type: DataTypes.STRING,         allowNull: false },
  zip:       { type: DataTypes.STRING },
  phone:     { type: DataTypes.STRING,         allowNull: false },
  total:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentId: { type: DataTypes.STRING },
  // pending | paid | payment_failed | canceled
  status:    { type: DataTypes.STRING,         defaultValue: 'pending' }
});

module.exports = Order;