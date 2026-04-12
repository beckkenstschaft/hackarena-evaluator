import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', 'admin_logs.json');

function readLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading logs:', err.message);
  }
  return {};
}

function writeLogs(logs) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error writing logs:', err.message);
  }
}

export function logAdminAction(adminName, action, details = {}) {
  const logs = readLogs();
  
  if (!logs[adminName]) {
    logs[adminName] = {
      loginCount: 0,
      sessions: []
    };
  }
  
  const session = logs[adminName].sessions[logs[adminName].sessions.length - 1];
  
  if (session) {
    session.actions.push({
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }
  
  writeLogs(logs);
}

export function logAdminLogin(adminName) {
  const logs = readLogs();
  
  if (!logs[adminName]) {
    logs[adminName] = {
      loginCount: 0,
      sessions: []
    };
  }
  
  logs[adminName].loginCount += 1;
  
  logs[adminName].sessions.push({
    loginTime: new Date().toISOString(),
    actions: [],
    tabsAccessed: []
  });
  
  writeLogs(logs);
  console.log(`[LOG] Admin "${adminName}" logged in. Total logins: ${logs[adminName].loginCount}`);
}

export function logAdminLogout(adminName) {
  const logs = readLogs();
  
  if (logs[adminName] && logs[adminName].sessions.length > 0) {
    const session = logs[adminName].sessions[logs[adminName].sessions.length - 1];
    if (session && !session.logoutTime) {
      session.logoutTime = new Date().toISOString();
      writeLogs(logs);
      console.log(`[LOG] Admin "${adminName}" logged out.`);
    }
  }
}

export function logTabAccess(adminName, tabName) {
  const logs = readLogs();
  
  if (logs[adminName] && logs[adminName].sessions.length > 0) {
    const session = logs[adminName].sessions[logs[adminName].sessions.length - 1];
    if (session && !session.tabsAccessed.includes(tabName)) {
      session.tabsAccessed.push(tabName);
      writeLogs(logs);
    }
  }
}

export function getAdminLogs(adminName) {
  const logs = readLogs();
  return logs[adminName] || null;
}

export function getAllLogs() {
  return readLogs();
}

export function resetLogs() {
  writeLogs({});
  console.log('[LOG] All logs reset');
}