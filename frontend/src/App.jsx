import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ScannerPage from './pages/ScannerPage';
import TeamsPage from './pages/TeamsPage';
import JudgesPage from './pages/JudgesPage';
import ResultsPage from './pages/ResultsPage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <h1>HackArena Scanner</h1>
        <nav className="nav">
          <Link to="/" className={isActive('/')}>Scan</Link>
          <Link to="/teams" className={isActive('/teams')}>Teams</Link>
          <Link to="/judges" className={isActive('/judges')}>Judges</Link>
          <Link to="/results" className={isActive('/results')}>Results</Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="container">
        <Routes>
          <Route path="/" element={<ScannerPage />} />
          <Route path="/scan" element={<ScannerPage />} />
          <Route path="/scan/:teamId" element={<ScannerPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/judges" element={<JudgesPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;