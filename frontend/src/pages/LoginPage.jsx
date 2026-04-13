import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/api';

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

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(username, password);
      if (response.success) {
        onLogin({ type: 'admin', name: response.name });
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  if (!loginType) {
    return (
      <div className="login-container">
        <video autoPlay muted loop playsInline className="login-video">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="login-overlay"></div>
        
        <div className="login-card">
          <h1 className="login-title">Hacknation</h1>
          <p className="login-subtitle">2026</p>
          <p className="login-desc">Select your login type</p>
          
          <div className="login-options">
            <button className="login-option-btn" onClick={handleJudgeLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
              </svg>
              Login as Judge
            </button>
            
            <button className="login-option-btn login-option-btn-secondary" onClick={() => setLoginType('admin')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
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
            position: relative;
          }
          .login-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
          }
          .login-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 15, 0.75);
            z-index: -1;
          }
          .login-card {
            background: transparent;
            border: none;
            border-radius: 24px;
            padding: 48px;
            width: 100%;
            max-width: 420px;
            animation: fadeInUp 0.6s ease-out;
          }
          .login-title {
            font-size: 42px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, var(--primary, #6366f1), var(--accent, #f472b6));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
            margin-bottom: 4px;
          }
          .login-subtitle {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-secondary, #71717a);
            text-align: center;
            letter-spacing: 4px;
            margin-bottom: 32px;
          }
          .login-desc {
            color: var(--text-secondary, #71717a);
            text-align: center;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .login-options {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .login-option-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 18px 24px;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            background: linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5));
            color: white;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
          }
          .login-option-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
          }
          .login-option-btn-secondary {
            background: rgba(255, 255, 255, 0.9);
            color: var(--text-primary, #18181b);
            border: 1px solid var(--border, #e4e4e7);
            box-shadow: none;
          }
          .login-option-btn-secondary:hover {
            background: white;
            border-color: var(--primary, #6366f1);
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.15);
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <video autoPlay muted loop playsInline className="login-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="login-overlay"></div>
      
      <div className="login-card">
        <button className="back-btn" onClick={() => setLoginType(null)}>← Back</button>
        
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">2026</p>
        <p className="login-desc">Enter your credentials</p>
        
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
          
          <button type="submit" className="login-submit-btn">Login</button>
        </form>
      </div>
      
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }
        .login-video {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
        }
        .login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 15, 0.75);
          z-index: -1;
        }
.login-card {
          background: transparent;
          border: none;
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          animation: fadeInUp 0.6s ease-out;
        }
        .login-title {
            font-size: 32px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, var(--primary, #6366f1), var(--accent, #f472b6));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin-bottom: 4px;
        }
        .login-subtitle {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-secondary, #71717a);
          text-align: center;
          letter-spacing: 4px;
          margin-bottom: 8px;
        }
        .login-desc {
          color: var(--text-secondary, #71717a);
          text-align: center;
          margin-bottom: 24px;
          font-size: 14px;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #71717a);
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .back-btn:hover { color: var(--primary, #6366f1); }
        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-secondary, #71717a);
          font-size: 14px;
        }
        .input {
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-secondary, #fff);
          border: 1.5px solid var(--border, #e4e4e7);
          border-radius: 12px;
          color: var(--text-primary, #18181b);
          font-size: 14px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: var(--primary, #6366f1);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .input::placeholder { color: var(--text-muted, #a1a1aa); }
        .error-message {
          color: var(--error, #ef4444);
          background: rgba(239, 68, 68, 0.08);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .login-submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }
        .login-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}