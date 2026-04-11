import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout';
import Toast from './components/Toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import TeamDashboard from './pages/TeamDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Teams from './pages/Teams';
import Scanner from './pages/Scanner';
import Evaluation from './pages/Evaluation';
import Hackathons from './pages/Hackathons';
import MyEvaluations from './pages/MyEvaluations';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        } />
        
        <Route element={<Layout />}>
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> :
               user?.role === 'judge' ? <JudgeDashboard /> :
               <TeamDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> :
               user?.role === 'judge' ? <JudgeDashboard /> :
               <TeamDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          
          <Route path="/teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          
          <Route path="/scanner" element={
            <ProtectedRoute roles={['admin', 'judge']}>
              <Scanner />
            </ProtectedRoute>
          } />
          
          <Route path="/judge" element={
            <ProtectedRoute roles={['admin', 'judge']}>
              <Evaluation />
            </ProtectedRoute>
          } />
          
          <Route path="/my-evaluations" element={
            <ProtectedRoute roles={['admin', 'judge']}>
              <MyEvaluations />
            </ProtectedRoute>
          } />
          
          <Route path="/hackathons" element={
            <ProtectedRoute roles={['admin']}>
              <Hackathons />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </>
  );
}