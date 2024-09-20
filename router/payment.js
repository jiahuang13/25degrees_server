const express = require('express');
const router = express.Router();
const { client } = require('../paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 创建订单的 API
router.post('/payment/create-order', async (req, res) => {
  const { amount } = req.body;
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'TWD',
        value: amount // 您的订单金额
      }
    }]
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 捕获订单的 API
router.post('/payment/capture-order', async (req, res) => {
  const { orderId } = req.body;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    res.json({ status: 'success', capture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment capture failed' });
  }
});

module.exports = router;
