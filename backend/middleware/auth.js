const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'אין טוקן' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    next();
  } catch {
    res.status(401).json({ message: 'טוקן לא תקין' });
  }
};

exports.requireManager = async (req, res, next) => {
  try {
    const isMgr = await Manager.exists({ user: req.user.id });
    console.log(req.user.id);
    
    if (!isMgr) return res.status(403).json({ message: 'אין הרשאת מנהל' });
    next();
  } catch {
    res.status(500).json({ message: 'שגיאת שרת בהרשאת מנהל' });
  }
};
