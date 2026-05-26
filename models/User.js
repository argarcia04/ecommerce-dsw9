const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  name:          { type: DataTypes.STRING(100), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false }
}, { tableName: 'users', timestamps: true });

User.beforeCreate(async (user) => {
  user.password_hash = await bcrypt.hash(user.password_hash, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});
User.prototype.validatePassword = async function(plain) {
  return bcrypt.compare(plain, this.password_hash);
};

module.exports = User;