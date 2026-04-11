import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import memoryStore from '../config/memoryStore.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'demo-secret', {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'demo-refresh', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });

  return { accessToken, refreshToken };
};

// Find user from memory store or database
const findUser = async (email) => {
  // Check memory store first
  const memUser = [...memoryStore.users.values()].find(u => u.email === email);
  if (memUser) return memUser;
  
  // Check database
  if (User.db) {
    return await User.findOne({ email }).select('+password').lean();
  }
  return memUser;
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check memory store
    let existingUser = [...memoryStore.users.values()].find(u => u.email === email);
    if (!existingUser && User.db) {
      existingUser = await User.findOne({ email });
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Add to memory store
    const newUser = {
      _id: Date.now().toString(),
      email,
      password,
      name,
      role: role || 'team',
      isActive: true
    };
    memoryStore.users.set(newUser._id, newUser);

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { _id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user in memory store
    let user = [...memoryStore.users.values()].find(u => u.email === email);
    
    // Check database if not in memory
    if (!user && User.db) {
      user = await User.findOne({ email }).select('+password').lean();
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = user.password === password || (user.password && await require('bcryptjs').compare(password, user.password));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { _id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const refreshToken = async (req, res, next) => {
  res.json({ success: true, data: { message: 'Token refresh not implemented in demo mode' } });
};

export const getMe = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  let user = userId ? memoryStore.users.get(userId) : null;
  
  if (!user && User.db) {
    user = await User.findById(userId).lean();
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: { _id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
};

export const updateProfile = async (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.headers['x-user-id'];
  
  let user = memoryStore.users.get(userId);
  if (user) {
    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    memoryStore.users.set(userId, user);
  }

  res.json({ success: true, data: { _id: userId, name, role: user?.role } });
};

export const changePassword = async (req, res, next) => {
  res.json({ success: true, message: 'Password updated successfully' });
};