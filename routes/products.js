const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/productController');
router.get('/',             ctrl.getHomePage);
router.get('/products',     ctrl.getAllProducts);
router.get('/products/:id', ctrl.getProductById);
module.exports = router;