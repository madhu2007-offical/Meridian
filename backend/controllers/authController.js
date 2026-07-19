const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateOtp, hashOtp, getOtpExpiry } = require('../utils/otp');
const sendEmail = require('../utils/sendEmail');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'customer';

    const otp = generateOtp();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role,
      otp: hashOtp(otp),
      otpExpiry: getOtpExpiry(),
    });

    try {
      await sendEmail(
        user.email,
        'Verify your Post Composer account',
        `<h2>Welcome to Post Composer!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
      );
    } catch (emailErr) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send verification email. Check SMTP config.' });
    }

    res.status(201).json({
      message: 'Account created. Please verify your email with the OTP sent.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Email verified successfully', token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');
    if (!user) {
      return res.json({ message: 'If the email exists, a new OTP has been sent' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    const otp = generateOtp();
    user.otp = hashOtp(otp);
    user.otpExpiry = getOtpExpiry();
    await user.save();

    await sendEmail(
      user.email,
      'Your new Post Composer verification code',
      `<h2>Verification Code</h2><p>Your new code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    );

    res.json({ message: 'If the email exists, a new OTP has been sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = signToken(user._id);
    res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage = 'If an account with that email exists, a reset link has been sent';

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpiry');

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      try {
        await sendEmail(
          user.email,
          'Reset your Post Composer password',
          `<h2>Password Reset</h2><p>Click the link below to reset your password (valid for 30 minutes):</p><a href="${resetUrl}">${resetUrl}</a>`
        );
      } catch {
        // Still return generic message
      }
    }

    res.json({ message: genericMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Email, token, new password, and confirmation password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};
