const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/cartController');
router.get('/',        ctrl.getCart);
router.post('/add',    ctrl.addToCart);
router.post('/update', ctrl.updateCartItem);
router.post('/remove', ctrl.removeCartItem);
module.exports = router;