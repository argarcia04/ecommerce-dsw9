const { Order, OrderItem } = require('../models');

// ── Base URL de la API de PayPal ─────────────────────────────────
const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// ── Obtiene un token de acceso de la API de PayPal ───────────────
async function getPayPalAccessToken() {
  const credentials = Buffer
    .from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`)
    .toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}
const checkoutController = {
  getCheckoutPage: (req, res) => {
    if (!req.session.cart || req.session.cart.items.length === 0)
      return res.redirect('/cart');
    res.render('checkout', { title: 'Finalizar Compra', cart: req.session.cart });
  },

  // 1. Crea la orden en la BD y muestra la página con los botones de PayPal
  processCheckout: async (req, res) => {
    try {
      if (!req.session.cart || req.session.cart.items.length === 0)
        return res.redirect('/cart');
      const cart  = req.session.cart;
      const order = await Order.create({
        firstName: req.body.firstName, lastName:  req.body.lastName,
        email:     req.body.email,     address:   req.body.address,
        city:      req.body.city,      province:  req.body.province,
        zip:       req.body.zip || '', phone:     req.body.phone,
        user_id:   req.session.userId || null,
        total:     cart.totalPrice,    status:    'pending'
        
      });
      for (const item of cart.items) {
        await OrderItem.create({
          OrderId:   order.id,
          ProductId: item.product.id,
          store_id:   item.product.store_id || null,
          quantity:  item.quantity,
          price:     item.product.price
        });
      }
      req.session.pendingOrderId = order.id;
      // Renderiza la vista con los botones de PayPal
      res.render('payment', {
        title: 'Procesar Pago',
        order,
        paypalClientId: process.env.PAYPAL_CLIENT_ID
      });
    } catch (err) {
      res.status(500).render('error', { title: 'Error', message: 'Error al procesar el pedido.' });
    }
  },

  // 2. El JS de payment.ejs llama a este endpoint para crear la orden en PayPal
  createPayPalOrder: async (req, res) => {
    try {
      const order       = await Order.findByPk(parseInt(req.body.orderId));
      if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
      const accessToken = await getPayPalAccessToken();
      const response    = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: order.id.toString(),
            amount: { currency_code: 'USD', value: parseFloat(order.total).toFixed(2) }
          }]
        })
      });
      const data = await response.json();
      res.json({ id: data.id }); // devuelve el ID de la orden PayPal al cliente
    } catch (err) {
      res.status(500).json({ error: 'Error al crear orden PayPal' });
    }
  },
  capturePayPalOrder: async (req, res) => {
    try {
      const { paypalOrderId, orderId } = req.body;
      const accessToken = await getPayPalAccessToken();
      const response    = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });
      const data     = await response.json();
      const captured = data.status === 'COMPLETED';

      const order = await Order.findByPk(parseInt(orderId));
      if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

      if (captured) {
        await order.update({ status: 'paid', paymentId: paypalOrderId });
        req.session.cart           = { items: [], totalQty: 0, totalPrice: 0 };
        req.session.pendingOrderId = null;
        res.json({ success: true, orderId: order.id });
      } else {
        await order.update({ status: 'payment_failed' });
        res.json({ success: false, status: data.status });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al capturar el pago' });
    }
  },

  handleCancelPayment: async (req, res) => {
    try {
      const order = await Order.findByPk(parseInt(req.query.orderId));
      if (order) await order.update({ status: 'cancelled' });
      res.render('payment-failed', {
        title:   'Pago Cancelado',
        message: 'Cancelaste el proceso de pago. Tu pedido no fue procesado.'
      });
    } catch (err) {
      res.status(500).render('error', { title: 'Error', message: 'Error al cancelar.' });
    }
  }
};

module.exports = checkoutController;