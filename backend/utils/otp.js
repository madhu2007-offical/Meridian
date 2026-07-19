const crypto = require('crypto');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const getOtpExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = { generateOtp, hashOtp, getOtpExpiry };
