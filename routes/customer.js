const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/customerController');
const { requireUserAuth } = require('../middleware/authMiddleware');

router.use(requireUserAuth);
router.get( '/dashboard',                   ctrl.dashboard);
router.get( '/orders',                      ctrl.listOrders);
router.get( '/orders/:id',                  ctrl.orderDetail);
router.get( '/wishlist',                    ctrl.wishlist);
router.post('/wishlist/add/:productId',     ctrl.addToWishlist);
router.post('/wishlist/remove/:productId',  ctrl.removeFromWishlist);

module.exports = router;