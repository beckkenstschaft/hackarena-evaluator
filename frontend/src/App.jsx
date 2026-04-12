import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ScannerPage from './pages/ScannerPage';
import TeamsPage from './pages/TeamsPage';
import JudgesPage from './pages/JudgesPage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

function Navigation({ isAdmin, onLogout, userName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isLanding = location.pathname === '/' || location.pathname === '/scan' || location.pathname.startsWith('/scan/') || location.pathname.includes('manual');

  const handleNavClick = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    onLogout();
    navigate('/');
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className={`header ${isLanding ? 'header-dark' : ''}`}>
        <div className="header-content">
          <h1 className={`header-logo ${isLanding ? 'text-white' : ''}`}>Hacknation</h1>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <nav className="nav-desktop">
            <Link to="/" className={isActive('/')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>
              Scan
            </Link>
            <Link to="/teams" className={isActive('/teams')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              Teams
            </Link>
            <Link to="/judges" className={isActive('/judges')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Judges
            </Link>
            <Link to="/results" className={isActive('/results')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Results
            </Link>
            {isAdmin && (
              <Link to="/admin" className={isActive('/admin')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                Admin
              </Link>
            )}
            <button className="logout-btn-nav" onClick={onLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}>
        <div className="sidebar" onClick={e => e.stopPropagation()}>
          <div className="sidebar-header">
            <h2>Hacknation</h2>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${isActive('/')}`} 
              onClick={() => handleNavClick('/')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Scan QR
            </button>
            <button 
              className={`sidebar-link ${isActive('/teams')}`} 
              onClick={() => handleNavClick('/teams')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Teams
            </button>
            <button 
              className={`sidebar-link ${isActive('/judges')}`} 
              onClick={() => handleNavClick('/judges')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Judges
            </button>
            <button 
              className={`sidebar-link ${isActive('/results')}`} 
              onClick={() => handleNavClick('/results')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Results
            </button>
            {isAdmin && (
              <button 
                className={`sidebar-link ${isActive('/admin')}`} 
                onClick={() => handleNavClick('/admin')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Admin
              </button>
            )}
            <button 
              className="sidebar-link logout-link" 
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <>
          <Navigation isAdmin={user.type === 'admin'} onLogout={handleLogout} />
          <main className="container">
            <Routes>
              <Route path="/" element={<ScannerPage />} />
              <Route path="/scan" element={<ScannerPage />} />
              <Route path="/scan/:teamId" element={<ScannerPage />} />
              <Route path="/teams" element={<TeamsPage isAdmin={user.type === 'admin'} />} />
              <Route path="/judges" element={<JudgesPage isAdmin={user.type === 'admin'} />} />
              <Route path="/results" element={<ResultsPage />} />
              {user.type === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; Syed Amaan Hasan. All rights reserved.</p>
          </footer>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;