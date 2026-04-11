import { useAuthStore } from '../store/useAuthStore';
import JudgeDashboard from './JudgeDashboard';
import TeamDashboard from './TeamDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'judge') {
    return <JudgeDashboard />;
  }
  
  return <TeamDashboard />;
}