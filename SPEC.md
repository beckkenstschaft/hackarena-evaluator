# HackArena Pro - Production Hackathon Evaluation Platform

## Project Overview

**Project Name:** HackArena Pro  
**Project Type:** Full-stack SaaS Web Application  
**Core Functionality:** A production-ready hackathon management and judging platform with QR-based team identification, real-time scoring, multi-round support, and live analytics  
**Target Users:** Hackathon organizers, judges, participating teams, and administrators

---

## Tech Stack

### Frontend
- **Framework:** React.js 18+ with Vite
- **Styling:** Tailwind CSS 3.4+
- **Animations:** Framer Motion 11+
- **State Management:** React Context + React Query
- **Charts:** Recharts
- **QR Scanning:** html5-qrcode
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JWT with refresh tokens
- **Password Hashing:** bcryptjs
- **Validation:** Joi
- **QR Generation:** qrcode

### DevOps
- **Environment:** dotenv
- **CORS:** cors middleware

---

## UI/UX Specification

### Design Philosophy
- Modern SaaS aesthetic (inspired by Stripe, Linear, Notion)
- Dark theme by default with glassmorphism effects
- Clean, professional typography with Inter font
- Smooth micro-interactions throughout

### Color Palette
```
Primary Colors:
- Primary: #6366f1 (Indigo-500)
- Primary Light: #818cf8 (Indigo-400)
- Primary Dark: #4f46e5 (Indigo-600)

Accent Colors:
- Accent: #f472b6 (Pink-400)
- Success: #22c55e (Green-500)
- Warning: #f59e0b (Amber-500)
- Error: #ef4444 (Red-500)

Dark Theme Backgrounds:
- BG Primary: #0a0a0f
- BG Secondary: #121218
- BG Tertiary: #1a1a24
- BG Card: #16161f | rgba(22, 22, 31, 0.8)
- BG Glass: rgba(255, 255, 255, 0.03)

Light Theme Backgrounds:
- BG Primary: #fafafa
- BG Secondary: #f5f5f5
- BG Card: #ffffff

Text Colors:
- Text Primary: #ffffff
- Text Secondary: #a1a1aa (Zinc-400)
- Text Muted: #71717a (Zinc-500)

Borders:
- Border: rgba(255, 255, 255, 0.08)
- Border Hover: rgba(255, 255, 255, 0.15)
```

### Typography
- **Font Family:** 'Inter', system-ui, sans-serif
- **Headings:**
  - H1: 36px/2.25rem, font-weight 800
  - H2: 30px/1.875rem, font-weight 700
  - H3: 24px/1.5rem, font-weight 600
  - H4: 20px/1.25rem, font-weight 600
- **Body:**
  - Large: 18px/1.125rem, font-weight 400
  - Regular: 16px/1rem, font-weight 400
  - Small: 14px/0.875rem, font-weight 400
  - XSmall: 12px/0.75rem, font-weight 500

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

### Layout Structure
- **Sidebar:** 280px fixed width, collapsible to 80px on mobile
- **Main Content:** Fluid, max-width 1440px centered
- **Header:** 64px height with sticky positioning
- **Content Padding:** 24px (desktop), 16px (mobile)
- **Card Padding:** 24px
- **Grid:** 12-column grid system

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Components

#### Buttons
- Primary: Indigo gradient with glow effect
- Secondary: Transparent with border
- Ghost: No border, hover background
- Danger: Red gradient
- States: Default → Hover (scale 1.02) → Active (scale 0.98) → Disabled (opacity 0.5)

#### Cards
- Background: BG Card with glass effect
- Border: 1px solid Border color
- Border Radius: 16px (large), 12px (medium), 8px (small)
- Hover: Subtle lift with shadow increase
- Transitions: 200ms cubic-bezier(0.4, 0, 0.2, 1)

#### Inputs
- Background: BG Tertiary
- Border: 1px solid Border color
- Focus: Ring with Primary color
- Height: 44px (default), 36px (small)

#### Tables
- Striped rows with alternating backgrounds
- Hover state with subtle highlight
- Sticky header for overflow

#### Modals
- Backdrop blur with dark overlay
- Scale + fade animation
- Max-width: 560px

#### Toast Notifications
- Slide in from right
- Success (green), Error (red), Warning (amber), Info (blue)
- Auto dismiss after 4 seconds

### Animations (Framer Motion)
- Page transitions: Fade + slide up (300ms)
- Card hover: Scale 1.02 + shadow
- Button tap: Scale 0.98
- Sidebar collapse: Width transition (200ms)
- Loading skeletons: Shimmer effect
- Number counters: Spring animation
- Charts: Draw animation on mount

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## Functionality Specification

### 1. Authentication System

#### User Roles
- **Admin:** Full system access, can manage hackathons, judges, teams
- **Judge:** Can evaluate teams, view leaderboard
- **Team:** Can register, view own scores

#### Signup Flow
1. User enters email, password, name, role selection
2. Server validates and hashes password
3. JWT token issued with role
4. Redirect to role-specific dashboard

#### Login Flow
1. Email + password submission
2. Server validates credentials
3. JWT access token (15min) + refresh token (7 days)
4. Tokens stored in httpOnly cookies

#### Protected Routes
- Admin routes: isAdmin middleware
- Judge routes: isJudge middleware
- Team routes: isAuthenticated middleware

### 2. Team Management

#### Team Registration
- Team name (unique)
- Project title
- Description (max 500 chars)
- Track/Category selection
- Team members (array of names)
- Contact email
- QR code auto-generated

#### Team Dashboard
- View submitted details
- Live score display
- Feedback from judges
- Qualification status per round

### 3. QR-Based Evaluation

#### QR Code Generation
- Unique QR per team containing: `{ baseUrl }/judge?team={teamId}&round={roundId}`
- QR downloadable as PNG
- Print-friendly format

#### Evaluation Form
Criteria (each 0-10):
- Innovation (40% weight)
- Technical Implementation (30% weight)
- UI/UX Design (20% weight)
- Presentation (10% weight)

Additional fields:
- Comments/feedback (text area)
- Media uploads (images, max 5MB)
- Overall recommendation (Qualify/Waitlist/Reject)

#### Duplicate Prevention
- One submission per judge per team per round
- Check before save, throw error if exists

### 4. Live Leaderboard

#### Features
- Real-time updates (polling every 5s)
- Sort by total score, individual criteria
- Filter by track, round
- Tie-breaking by: Innovation > Technical > UI/UX > Presentation

#### Display
- Top 3 podium view
- Full table with rankings
- Score breakdown
- Number of judges who scored

### 5. Multi-Round System

#### Round Management
- Create rounds with name, description, status
- Set qualification threshold
- Timeline (start/end dates)

#### Round Flow
- Each round has separate scores
- Teams qualify based on threshold
- Final round shows final rankings

### 6. Admin Dashboard

#### Hackathon Management
- Create/edit hackathon details
- Configure tracks
- Manage rounds
- Set judging criteria weights

#### Judge Management
- Add/remove judges
- View judge activity
- Performance metrics

#### Analytics
- Total teams, submissions
- Average scores per track
- Judge activity heatmap
- Score distribution charts
- Top performing teams

#### Export
- CSV export for all scores
- PDF report generation

### 7. Notifications

#### Real-time Alerts
- New submission to admin
- Qualification status to team
- Score received confirmation

---

## Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed),
  name: String (required),
  role: Enum ['admin', 'judge', 'team'],
  avatar: String,
  isActive: Boolean,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Hackathon
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  tracks: [String],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Team
```javascript
{
  _id: ObjectId,
  hackathon: ObjectId (ref: Hackathon),
  teamName: String (required),
  projectTitle: String,
  description: String,
  track: String,
  members: [{ name: String, role: String }],
  contactEmail: String,
  qrCode: String,
  isQualified: Boolean,
  roundStatus: [{ round: ObjectId, status: String }],
  createdAt: Date,
  updatedAt: Date
}
```

### Round
```javascript
{
  _id: ObjectId,
  hackathon: ObjectId (ref: Hackathon),
  name: String (required),
  description: String,
  order: Number,
  qualificationThreshold: Number,
  isActive: Boolean,
  startDate: Date,
  endDate: Date
}
```

### Evaluation
```javascript
{
  _id: ObjectId,
  team: ObjectId (ref: Team),
  judge: ObjectId (ref: User),
  round: ObjectId (ref: Round),
  scores: {
    innovation: Number (0-10),
    technical: Number (0-10),
    uiux: Number (0-10),
    presentation: Number (0-10)
  },
  totalScore: Number,
  comments: String,
  media: [{ url: String, type: String }],
  recommendation: Enum ['qualify', 'waitlist', 'reject'],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

### Teams
- POST /api/teams
- GET /api/teams
- GET /api/teams/:id
- PUT /api/teams/:id
- DELETE /api/teams/:id
- GET /api/teams/:id/qrcode

### Evaluations
- POST /api/evaluations
- GET /api/evaluations
- GET /api/evaluations/:teamId
- GET /api/evaluations/judge/:judgeId

### Leaderboard
- GET /api/leaderboard
- GET /api/leaderboard/:roundId

### Admin
- POST /api/admin/hackathons
- GET /api/admin/hackathons
- PUT /api/admin/hackathons/:id
- POST /api/admin/rounds
- GET /api/admin/analytics
- POST /api/admin/export

---

## Security Measures

### API Security
- Rate limiting: 100 requests per 15 minutes
- Input validation on all endpoints
- SQL injection prevention
- XSS prevention
- CORS configuration
- Helmet.js headers

### Data Security
- Password hashing with bcrypt (10 rounds)
- JWT with short expiration
- Refresh token rotation
- Secure cookie flags

---

## Acceptance Criteria

### Authentication
- [ ] Users can sign up with email/password
- [ ] Users can log in and receive JWT
- [ ] Protected routes redirect to login
- [ ] Role-based access works correctly

### Team Management
- [ ] Teams can register with all required fields
- [ ] QR code generates correctly
- [ ] Teams can view their dashboard

### Evaluation
- [ ] Judges can scan QR to open evaluation
- [ ] All criteria scores save correctly
- [ ] Duplicate submissions blocked
- [ ] Media uploads work

### Leaderboard
- [ ] Live updates work
- [ ] Sorting and filtering works
- [ ] Top 3 display correctly

### Admin
- [ ] Full CRUD on all entities
- [ ] Analytics display correctly
- [ ] Export produces valid CSV

### UI/UX
- [ ] Dark theme renders correctly
- [ ] Glassmorphism effects visible
- [ ] Animations are smooth
- [ ] Responsive on all breakpoints
- [ ] Loading states display

### Performance
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] No memory leaks on long sessions