const User = require('../models/user')
const Manager = require('../models/Manager');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const createInitialAdmin = async () => {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (!adminExists) {
//         const hash = await bcrypt.hash('000', 10);
//         const user = await User.create({
//             name: 'Admin',
//             phone: '000',
//             password: hash,
//             role: 'admin'
//         });
//         await Manager.create({ user: user._id });
//         console.log('Admin user created');
//     }
// };
// createInitialAdmin(); 

// hashes the password and creates a new user account

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, phone, password: hash,
      isVerified: true,
    });
    res.status(201).json({ id: user._id });
  } catch (err) {
    res.status(400).json({ message: 'נתונים שגויים בהרשמה', error: err });
  }
};

// checks phone and password, and returns a JWT token with user role info
exports.login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'פרטי התחברות שגויים' });
    }
    const managerData = await Manager.findOne({ user: user._id });

    const payload = {
      id: user._id,
      name: user.name,
      isManager: !!managerData,
      isSuperManager: managerData?.isSuperManager || false,
      phone: user.phone
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, isManager: !!managerData, isSuperManager: managerData?.isSuperManager || false });
  } catch (err) {
    res.status(500).json({ message: 'שגיאת שרת בכניסה', error: err });
  }
};

// returns a list of all registered users in the system
exports.getAllUsers = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find().skip(skip).limit(limit);
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch users' });
  }
};

// deletes a user and removes their manager record if they are a manager
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await Manager.deleteMany({ user: id });
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    res.json({ message: 'המשתמש נמחק בהצלחה' });
  } catch (err) {
    res.status(500).json({ message: 'שגיאה במחיקת המשתמש', error: err });
  }
};

// updates the name and phone number of the logged-in user
exports.update = async (req, res) => {
  const { name, phone } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(userId, { name, phone }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בעדכון המשתמש', error: err });
  }
};
