const { Store, Product, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

// GET /store-admin/dashboard
const dashboard = async (req, res) => {
  const storeId = req.session.storeId;
  const store   = await Store.findByPk(storeId);

  // Ventas del mes actual
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const items = await OrderItem.findAll({
    where: { store_id: storeId, createdAt: { [Op.gte]: monthStart } },
    include: [{ model: Order, as: 'order' }]
  });
  const monthSales  = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const orderCount  = new Set(items.map(i => i.order_id)).size;
  const productCount= await Product.count({ where: { store_id: storeId } });

  res.render('store-admin/dashboard', { layout: false,
    store, monthSales: monthSales.toFixed(2), orderCount, productCount
  });
};

// GET /store-admin/products
const listProducts = async (req, res) => {
  const products = await Product.findAll({
    where: { store_id: req.session.storeId },
    order: [['createdAt', 'DESC']]
  });
  res.render('store-admin/products', { layout: false, products });
};
const showNewProduct = (req, res) =>
  res.render('store-admin/product-form', { layout: false, product: null, error: null });

const createProduct = async (req, res) => {
  const { name, description, price, stock, imageUrl } = req.body;
  try {
    await Product.create({
      name, description, price, stock: stock || 0,
      imageUrl: imageUrl || '/images/placeholder.png',
      store_id: req.session.storeId
    });
    res.redirect('/store-admin/products');
  } catch (err) {
    res.render('store-admin/product-form', { layout: false, product: null, error: 'Error al crear el producto.' });
  }
};

const showEditProduct = async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.id, store_id: req.session.storeId }
  });
  if (!product) return res.redirect('/store-admin/products');
  res.render('store-admin/product-form', { layout: false, product, error: null });
};

const updateProduct = async (req, res) => {
  const { name, description, price, stock, imageUrl } = req.body;
  await Product.update(
    { name, description, price, stock, imageUrl },
    { where: { id: req.params.id, store_id: req.session.storeId } }
  );
  res.redirect('/store-admin/products');
};

const deleteProduct = async (req, res) => {
  await Product.destroy({
    where: { id: req.params.id, store_id: req.session.storeId }
  });
  res.redirect('/store-admin/products');
};
const { sequelize } = require('../config/database');

// GET /store-admin/orders
const listOrders = async (req, res) => {
  const items = await OrderItem.findAll({
    where: { store_id: req.session.storeId },
    include: [
      { model: Order,   as: 'order'   },
      { model: Product, as: 'product' }
    ],
    order: [['createdAt', 'DESC']],
    limit: 50
  });
  // Agrupar items por orden
  const ordersMap = {};
  items.forEach(item => {
    const oid = item.order_id;
    if (!ordersMap[oid]) ordersMap[oid] = { order: item.order, items: [] };
    ordersMap[oid].items.push(item);
  });
  const orders = Object.values(ordersMap);
  res.render('store-admin/orders', { layout: false, orders });
};

// GET /store-admin/settings
const showSettings = async (req, res) => {
  const store = await Store.findByPk(req.session.storeId);
  res.render('store-admin/settings', { layout: false, store, success: null, error: null });
};

// POST /store-admin/settings (actualizar paypal_email y datos de tienda)
const updateSettings = async (req, res) => {
  const { name, description, paypal_email } = req.body;
  await Store.update(
    { name, description, paypal_email },
    { where: { id: req.session.storeId } }
  );
  const store = await Store.findByPk(req.session.storeId);
  res.render('store-admin/settings', { layout: false, store, success: 'Configuracion actualizada.', error: null });
};

module.exports = {
  dashboard, listProducts, showNewProduct, createProduct,
  showEditProduct, updateProduct, deleteProduct,
  listOrders, showSettings, updateSettings
};