// In-memory data store for demo mode
const users = new Map();
const hackathons = new Map();
const teams = new Map();
const rounds = new Map();
const evaluations = new Map();

// Initialize demo data
function initDemoData() {
  // Demo users
  const demoUsers = [
    { _id: '1', email: 'admin@demo.com', password: 'password123', name: 'Admin User', role: 'admin', isActive: true },
    { _id: '2', email: 'judge@demo.com', password: 'password123', name: 'Judge User', role: 'judge', isActive: true },
    { _id: '3', email: 'team@demo.com', password: 'password123', name: 'Team User', role: 'team', isActive: true }
  ];
  demoUsers.forEach(u => users.set(u._id, u));

  // Demo hackathon
  const hackathon = {
    _id: 'h1',
    name: 'HackArena Demo 2026',
    description: 'A demo hackathon event',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-30'),
    isActive: true,
    tracks: ['AI/ML', 'Blockchain', 'Web3', 'IoT', 'FinTech'],
    createdBy: '1'
  };
  hackathons.set(hackathon._id, hackathon);

  // Demo rounds
  const round1 = {
    _id: 'r1',
    hackathon: 'h1',
    name: 'Idea Round',
    order: 1,
    isActive: true,
    isPublished: true
  };
  rounds.set(round1._id, round1);

  // Demo teams
  const demoTeams = [
    { _id: 't1', teamName: 'Alpha Innovators', projectTitle: 'AI Health Assistant', track: 'AI/ML', members: [{ name: 'John' }, { name: 'Jane' }], totalScore: 32, averageScore: 8, judgeCount: 4, status: 'qualified', hackathon: 'h1', user: '3' },
    { _id: 't2', teamName: 'Beta Wizards', projectTitle: 'Blockchain Supply Chain', track: 'Blockchain', members: [{ name: 'Mike' }], totalScore: 28, averageScore: 7, judgeCount: 4, status: 'registered', hackathon: 'h1', user: '3' },
    { _id: 't3', teamName: 'Gamma Coders', projectTitle: 'AR Navigation System', track: 'AI/ML', members: [{ name: 'Sarah' }, { name: 'Tom' }], totalScore: 35, averageScore: 8.75, judgeCount: 4, status: 'qualified', hackathon: 'h1', user: '3' }
  ];
  demoTeams.forEach(t => teams.set(t._id, { ...t, qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }));

  // Demo evaluations
  const demoEvals = [
    { _id: 'e1', team: 't1', judge: '2', round: 'r1', hackathon: 'h1', scores: { innovation: 8, technical: 8, uiux: 8, presentation: 8 }, totalScore: 32, recommendation: 'qualify' },
    { _id: 'e2', team: 't2', judge: '2', round: 'r1', hackathon: 'h1', scores: { innovation: 7, technical: 7, uiux: 7, presentation: 7 }, totalScore: 28, recommendation: 'waitlist' },
    { _id: 'e3', team: 't3', judge: '2', round: 'r1', hackathon: 'h1', scores: { innovation: 9, technical: 9, uiux: 8, presentation: 9 }, totalScore: 35, recommendation: 'qualify' }
  ];
  demoEvals.forEach(e => evaluations.set(e._id, e));

  console.log('Demo data initialized');
}

initDemoData();

export const memoryStore = {
  users,
  hackathons,
  teams,
  rounds,
  evaluations
};

export default memoryStore;