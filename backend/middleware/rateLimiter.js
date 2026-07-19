const rateLimit = require('express-rate-limit');

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many signup attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendOtpLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
  message: { message: 'Please wait 30 seconds before resending OTP' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many password reset requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { signupLimiter, loginLimiter, resendOtpLimiter, forgotPasswordLimiter };
