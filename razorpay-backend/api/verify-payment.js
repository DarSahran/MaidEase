const crypto = require('crypto');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { paymentId, orderId, signature } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  if (generated_signature === signature) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
};
