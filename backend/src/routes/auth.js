import express from 'express';
import { logAdminLogin, logAdminLogout, logTabAccess, logAdminAction, getAllLogs } from '../utils/logger.js';

const router = express.Router();

const ADMIN_USERS = [
  { name: 'Kshitij Jain', username: 'Kshitij Jain', password: 'Admin@kshitij2026' },
  { name: 'Syed Amaan Hasan', username: 'Syed Amaan Hasan', password: 'Tatazest1065@' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const admin = ADMIN_USERS.find(
    u => u.username === username && u.password === password
  );
  
  if (admin) {
    logAdminLogin(admin.name);
    res.json({ success: true, name: admin.name });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => {
  const { adminName } = req.body;
  if (adminName) {
    logAdminLogout(adminName);
  }
  res.json({ success: true });
});

router.post('/tab-access', (req, res) => {
  const { adminName, tabName } = req.body;
  if (adminName && tabName) {
    logTabAccess(adminName, tabName);
  }
  res.json({ success: true });
});

router.post('/action', (req, res) => {
  const { adminName, action, details } = req.body;
  if (adminName && action) {
    logAdminAction(adminName, action, details);
  }
  res.json({ success: true });
});

router.get('/logs', (req, res) => {
  const logs = getAllLogs();
  res.json(logs);
});

export default router;