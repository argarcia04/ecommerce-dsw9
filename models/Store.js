const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Store = sequelize.define('Store', {
  name:          { type: DataTypes.STRING(100), allowNull: false },
  slug:          { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description:   { type: DataTypes.TEXT },
  logo_url:      { type: DataTypes.STRING(255) },
  owner_name:    { type: DataTypes.STRING(100), allowNull: false },
  store_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'stores', key: 'id' } }
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  paypal_email:  { type: DataTypes.STRING(150) },   // para recibir payouts
  status:        { type: DataTypes.ENUM('pending','active','suspended'),
                   defaultValue: 'active' }
}, { tableName: 'stores', timestamps: true });


// Hashear password antes de crear/actualizar
Store.beforeCreate(async (store) => {
  store.password_hash = await bcrypt.hash(store.password_hash, 10);
});
Store.beforeUpdate(async (store) => {
  if (store.changed('password_hash')) {
    store.password_hash = await bcrypt.hash(store.password_hash, 10);
  }
});
Store.prototype.validatePassword = async function(plain) {
  return bcrypt.compare(plain, this.password_hash);
};

module.exports = Store;