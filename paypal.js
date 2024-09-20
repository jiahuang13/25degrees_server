const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// PayPal 环境配置
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  // 如果使用生产环境，替换为 LiveEnvironment
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
