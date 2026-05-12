const { Product } = require('../models');
const productController = {
  getHomePage: async (req, res) => {
    try {
      const featuredProducts = await Product.findAll({ limit: 3 });
      res.render('index', { title: 'Inicio', featuredProducts });
    } catch (err) {
      res.status(500).render('error', { title:'Error', message:'Error al cargar inicio' });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.findAll();
      res.render('products', { title: 'Productos', products });
    } catch (err) {
      res.status(500).render('error', { title:'Error', message:'Error al cargar productos' });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).render('404', { title:'No encontrado' });
      res.render('product-detail', { title: product.name, product });
    } catch (err) {
      res.status(500).render('error', { title:'Error', message:'Error al cargar producto' });
    }
  }
};
module.exports = productController;