import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEMO_USERS = [
  { _id: '1', email: 'admin@demo.com', name: 'Admin User', role: 'admin', password: 'password123' },
  { _id: '2', email: 'judge@demo.com', name: 'Judge Smith', role: 'judge', password: 'password123' },
  { _id: '3', email: 'team@demo.com', name: 'Team Alpha', role: 'team', password: 'password123' }
];

const DEMO_HACKATHON = {
  _id: 'h1',
  name: 'HackArena Demo 2026',
  description: 'National Level Hackathon',
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  isActive: true,
  tracks: ['AI/ML', 'Blockchain', 'Web3', 'IoT', 'FinTech'],
  createdBy: '1'
};

const DEMO_TEAMS = [
  { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML', members: [{name: 'John Doe', role: 'Leader'}, {name: 'Jane Smith', role: 'Developer'}], totalScore: 135, averageScore: 8.75, judgeCount: 12, status: 'qualified', hackathon: 'h1', user: '3' },
  { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain', members: [{name: 'Mike Ross', role: 'CEO'}], totalScore: 118, averageScore: 7.15, judgeCount: 12, status: 'registered', hackathon: 'h1', user: '3' },
  { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML', members: [{name: 'Sarah Connor', role: 'Team Lead'}, {name: 'Tom Hardy', role: 'Backend'}], totalScore: 142, averageScore: 9.2, judgeCount: 12, status: 'qualified', hackathon: 'h1', user: '3' },
  { _id: 't4', teamName: 'Delta Vision', projectTitle: 'Sustainable Energy IoT', track: 'IoT', members: [{name: 'Emma Watson', role: 'Lead'}], totalScore: 98, averageScore: 6.5, judgeCount: 10, status: 'registered', hackathon: 'h1', user: '3' },
  { _id: 't5', teamName: 'Omega Developers', projectTitle: 'DeFi Platform', track: 'FinTech', members: [{name: 'Chris Evans', role: 'Founder'}], totalScore: 125, averageScore: 8.0, judgeCount: 11, status: 'qualified', hackathon: 'h1', user: '3' }
];

const DEMO_EVALUATIONS = [
  { _id: 'e1', team: 't1', judge: '2', scores: { innovation: 9, technical: 8, uiux: 8, presentation: 9 }, totalScore: 34, recommendation: 'qualify', comments: 'Great innovation!', createdAt: '2026-04-05' },
  { _id: 'e2', team: 't3', judge: '2', scores: { innovation: 10, technical: 9, uiux: 9, presentation: 10 }, totalScore: 38, recommendation: 'qualify', comments: 'Excellent work!', createdAt: '2026-04-05' },
  { _id: 'e3', team: 't2', judge: '2', scores: { innovation: 7, technical: 7, uiux: 7, presentation: 7 }, totalScore: 28, recommendation: 'waitlist', comments: 'Good concept', createdAt: '2026-04-05' }
];

const initializeDemoData = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('hackarena_teams')) {
      localStorage.setItem('hackarena_teams', JSON.stringify(DEMO_TEAMS));
    }
    if (!localStorage.getItem('hackarena_evaluations')) {
      localStorage.setItem('hackarena_evaluations', JSON.stringify(DEMO_EVALUATIONS));
    }
    if (!localStorage.getItem('hackarena_hackathon')) {
      localStorage.setItem('hackarena_hackathon', JSON.stringify(DEMO_HACKATHON));
    }
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log('Login attempt:', email, password);
        
        await new Promise(r => setTimeout(r, 800));
        
        const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        console.log('Found user:', user);
        
        if (user && user.password === password) {
          console.log('Login success!');
          const { password: _, ...safeUser } = user;
          set({ user: safeUser, isAuthenticated: true, isLoading: false });
          initializeDemoData();
          return { data: { user: safeUser } };
        }
        
        console.log('Login failed');
        set({ isLoading: false, error: 'Invalid credentials - use admin@demo.com / password123' });
        throw new Error('Invalid credentials');
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        await new Promise(r => setTimeout(r, 500));
        
        const newUser = { 
          _id: Date.now().toString(), 
          email: userData.email, 
          name: userData.name, 
          role: userData.role || 'team',
          password: userData.password
        };
        
        const { password, ...safeUser } = newUser;
        set({ user: safeUser, isAuthenticated: true, isLoading: false });
        return { data: { user: safeUser } };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'hackarena-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export const useTeamStore = create(
  persist(
    (set, get) => ({
      teams: [],
      hackathon: null,
      loading: false,

      fetchTeams: async () => {
        set({ loading: true });
        await new Promise(r => setTimeout(r, 300));
        
        const stored = localStorage.getItem('hackarena_teams');
        const teams = stored ? JSON.parse(stored) : DEMO_TEAMS;
        const hackathon = JSON.parse(localStorage.getItem('hackarena_hackathon') || 'null') || DEMO_HACKATHON;
        
        set({ teams, hackathon, loading: false });
      },

      getTeamById: (id) => {
        const stored = localStorage.getItem('hackarena_teams');
        const teams = stored ? JSON.parse(stored) : DEMO_TEAMS;
        return teams.find(t => t._id === id);
      },

      addTeam: (team) => {
        const stored = localStorage.getItem('hackarena_teams');
        const teams = stored ? JSON.parse(stored) : DEMO_TEAMS;
        teams.push(team);
        localStorage.setItem('hackarena_teams', JSON.stringify(teams));
        set({ teams });
      }
    }),
    { name: 'hackarena-teams' }
  )
);