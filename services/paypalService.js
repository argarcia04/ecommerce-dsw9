const paypal = require('@paypal/payouts-sdk');

function getClient() {
  const env = process.env.PAYPAL_MODE === 'sandbox'
    ? new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
  return new paypal.core.PayPalHttpClient(env);
}

/**
 * Envia un payout a un email de PayPal.
 * @param {string} recipientEmail  - Email PayPal del receptor
 * @param {string} amount          - Monto en string, ej: "25.50"
 * @param {string} currency        - "USD"
 * @param {string} note            - Mensaje al receptor
 * @returns {object} resultado de la API
 */
async function sendPayout(recipientEmail, amount, currency = 'USD', note = '') {
  const client = getClient();
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody({
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}`,
      email_subject:   'Has recibido un pago del marketplace DSW9',
      email_message:   note
    },
    items: [{
      recipient_type: 'EMAIL',
      amount: { value: amount, currency },
      receiver:   recipientEmail,
      note:       note,
      sender_item_id: `item_${Date.now()}`
    }]
  });
  const response = await client.execute(request);
  return response.result;
}

module.exports = { sendPayout };

const { Store, OrderItem, Order } = require('../models');
const { Op } = require('sequelize');

// Helper: calcula el total de ventas pagadas de una tienda
async function calcTotalSales(storeId) {
  const items = await OrderItem.findAll({
    where: { store_id: storeId },
    include: [{ model: Order, as: 'order',
      where: { status: { [Op.in]: ['completed', 'paid'] } }
    }]
  });
  return items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
}

// GET /store-admin/payout
const showPayout = async (req, res) => {
  const storeId   = req.session.storeId;
  const store     = await Store.findByPk(storeId);
  const totalSales = await calcTotalSales(storeId);

  res.render('store-admin/payout', { layout: false,
    store,
    totalSales: totalSales.toFixed(2),
    success: null,
    error:   null
  });
};
const { sendPayout } = require('../services/paypalService');

// POST /store-admin/payout
const processPayout = async (req, res) => {
  const storeId = req.session.storeId;
  const store   = await Store.findByPk(storeId);

  if (!store.paypal_email) {
    const totalSales = await calcTotalSales(storeId);
    return res.render('store-admin/payout', { layout: false,
      store, totalSales: totalSales.toFixed(2),
      error:   'Configura tu email de PayPal en Ajustes antes de solicitar un pago.',
      success: null
    });
  }

  const requested = parseFloat(req.body.amount);
  try {
    const result = await sendPayout(
      store.paypal_email,
      requested.toFixed(2),
      'USD',
      `Pago de ventas — ${store.name}`
    );

    // Recalcula el balance real: ventas totales menos lo que se acaba de pagar
    const totalSales    = await calcTotalSales(storeId);
    const remaining     = Math.max(0, totalSales - requested).toFixed(2);

    res.render('store-admin/payout', { layout: false,
      store,
      totalSales: remaining,
      success: `Payout de $${requested.toFixed(2)} enviado. ID: ${result.batch_header.payout_batch_id}`,
      error:   null
    });
  } catch (err) {
    const totalSales = await calcTotalSales(storeId);
    res.render('store-admin/payout', { layout: false,
      store,
      totalSales: totalSales.toFixed(2),
      error:   'Error al procesar el payout: ' + (err.message || 'desconocido'),
      success: null
    });
  }
};

module.exports = { showPayout, processPayout };