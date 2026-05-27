const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/storeAdminController');
const { requireStoreAuth } = require('../middleware/authMiddleware');
const paypalCtrl = require('../controllers/paypalController');
// Todas las rutas requieren sesion de tienda
router.use(requireStoreAuth);

router.get( '/dashboard',             ctrl.dashboard);
router.get( '/products',              ctrl.listProducts);
router.get( '/products/new',          ctrl.showNewProduct);
router.post('/products',              ctrl.createProduct);
router.get( '/products/:id/edit',     ctrl.showEditProduct);
router.post('/products/:id',          ctrl.updateProduct);
router.post('/products/:id/delete',   ctrl.deleteProduct);
router.get( '/orders',                ctrl.listOrders);
router.get( '/settings',              ctrl.showSettings);
router.post('/settings',              ctrl.updateSettings);

router.get( '/payout', paypalCtrl.showPayout);
router.post('/payout', paypalCtrl.processPayout);
module.exports = router;
