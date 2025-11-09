const User = require('../models/User');

// Register ใหม่
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username หรือ Email นี้มีอยู่ในระบบแล้ว' 
      });
    }

    // สร้าง user ใหม่
    const user = new User({
      username,
      email,
      passwordHash: password // จะถูก hash ใน pre-save middleware
    });

    await user.save();

    // สร้าง JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // หา user ด้วย username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    // ตรวจสอบ password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    // สร้าง JWT token
    const token = user.generateAuthToken();

    res.json({
      message: `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${user.username}`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  }
};

// ตรวจสอบสถานะ token
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({
      message: 'ข้อมูลผู้ใช้',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: error.message });
  }
};
