const bcrypt = require('bcryptjs');
const Verification = require('../models/Verification');

// generates a random 4-digit code, hashes it, and saves it with a 5-minute expiration
exports.sendCode = async (req, res) => {
  try {
    const { phone } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'מספר הטלפון הזה כבר רשום במערכת' });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const hash = await bcrypt.hash(code, 10);
    const expires = Date.now() + 5 * 60 * 1000;

    let verification = await Verification.findOne({ phone });
    
    console.log('-----------------------------------')
    if (verification) {
      verification.codeHash = hash;
      verification.expires = expires;
      verification.attempts = 0;
    } else {
      verification = new Verification({
        phone,
        codeHash: hash,
        expires,
        attempts: 0,
      });
    }
    await verification.save();

    console.log(`Verification code for ${phone}: ${code}`);
    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending code' });
  }
};

// checks if the entered code matches the saved hash and hasn't expired or exceeded 5 attempts
exports.verifyCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const verification = await Verification.findOne({ phone });

    if (!verification) {
      return res.status(404).json({ message: 'Verification record not found' });
    }

    if (verification.attempts >= 5) {
      await Verification.deleteOne({ _id: verification._id });
      return res.status(403).json({ message: 'Too many verification attempts. Verification record removed.' });
    }

    if (Date.now() > verification.expires) {
      await Verification.deleteOne({ _id: verification._id });
      return res.status(400).json({ message: 'Code expired, please request a new one' });
    }

    const isMatch = await bcrypt.compare(code, verification.codeHash);
    if (!isMatch) {
      verification.attempts += 1;
      await verification.save();
      return res.status(400).json({ message: 'Incorrect code' });
    }

    await Verification.deleteOne({ _id: verification._id });
    res.json({ message: 'Verification successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying code' });
  }
};