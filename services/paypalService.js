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