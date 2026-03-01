const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PasswordResetToken = require('../models/PasswordResetToken');
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"SecureOrder" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, role: role || 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get current user (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Delete old tokens
    await PasswordResetToken.deleteMany({ user: user._id });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await PasswordResetToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      'SecureOrder Password Reset',
      `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#7c3aed; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
        <p>SecureOrder Team</p>
      `
    );

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenDoc = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!resetTokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(resetTokenDoc.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};