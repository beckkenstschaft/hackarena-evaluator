import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USERS = [
  { name: 'Kshitij Jain', username: 'Kshitij Jain', password: 'Admin@kshitij2026' },
  { name: 'Syed Amaan Hasan', username: 'Syed Amaan Hasan', password: 'Tatazest1065@' }
];

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJudgeLogin = () => {
    onLogin({ type: 'judge' });
    navigate('/');
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const admin = ADMIN_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (admin) {
      onLogin({ type: 'admin', name: admin.name });
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  if (!loginType) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome to Hacknation</h1>
          <p className="login-subtitle">Select your login type</p>
          
          <div className="login-options">
            <button 
              className="login-option-btn"
              onClick={handleJudgeLogin}
            >
              <span className="login-option-icon">⚖️</span>
              Login as Judge
            </button>
            
            <button 
              className="login-option-btn login-option-btn-secondary"
              onClick={() => setLoginType('admin')}
            >
              <span className="login-option-icon">🔐</span>
              Admin Login
            </button>
          </div>
        </div>
        
        <style>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .login-card {
            background: var(--bg-card, #fff);
            border: 1px solid var(--border, #e4e4e7);
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
          }
          
          .login-title {
            font-size: 28px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
            text-align: center;
            margin-bottom: 8px;
          }
          
          .login-subtitle {
            color: var(--text-secondary, #71717a);
            text-align: center;
            margin-bottom: 32px;
          }
          
          .login-options {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .login-option-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 18px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            background: linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5));
            color: white;
          }
          
          .login-option-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          
          .login-option-btn-secondary {
            background: var(--bg-tertiary, #f4f4f5);
            color: var(--text-primary, #18181b);
            border: 1px solid var(--border, #e4e4e7);
          }
          
          .login-option-btn-secondary:hover {
            background: var(--bg-secondary, #fff);
            border-color: var(--primary, #6366f1);
          }
          
          .login-option-icon {
            font-size: 20px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <button 
          className="back-btn"
          onClick={() => setLoginType(null)}
        >
          ← Back
        </button>
        
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Enter your credentials</p>
        
        <form onSubmit={handleAdminSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            Login
          </button>
        </form>
      </div>
      
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .login-card {
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e4e4e7);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
        }
        
        .login-title {
          font-size: 28px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          text-align: center;
          margin-bottom: 8px;
        }
        
        .login-subtitle {
          color: var(--text-secondary, #71717a);
          text-align: center;
          margin-bottom: 32px;
        }
        
        .back-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #71717a);
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 0;
        }
        
        .back-btn:hover {
          color: var(--text-primary, #18181b);
        }
        
        .error-message {
          color: var(--error, #ef4444);
          background: rgba(239, 68, 68, 0.08);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}