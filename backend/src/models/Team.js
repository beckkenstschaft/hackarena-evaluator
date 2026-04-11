import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  }
});

const teamSchema = new mongoose.Schema({
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: [true, 'Hackathon reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  projectTitle: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  track: {
    type: String,
    required: true,
    trim: true
  },
  members: [memberSchema],
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  qrCode: {
    type: String
  },
  prototypeLink: {
    type: String,
    trim: true
  },
  repositoryLink: {
    type: String,
    trim: true
  },
  isQualified: {
    type: Boolean,
    default: false
  },
  currentRound: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  },
  status: {
    type: String,
    enum: ['registered', 'qualified', 'rejected', 'withdrawn'],
    default: 'registered'
  },
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  judgeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

teamSchema.index({ teamName: 1, hackathon: 1 }, { unique: true });
teamSchema.index({ hackathon: 1, track: 1 });
teamSchema.index({ hackathon: 1, totalScore: -1 });

const Team = mongoose.model('Team', teamSchema);
export default Team;