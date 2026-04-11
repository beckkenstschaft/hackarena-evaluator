import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    default: 'image'
  },
  filename: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const evaluationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team reference is required']
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Judge reference is required']
  },
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: [true, 'Round reference is required']
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  scores: {
    innovation: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    technical: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    uiux: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    presentation: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    }
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 40
  },
  weightedScore: {
    type: Number,
    default: 0
  },
  comments: {
    type: String,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  strengths: {
    type: String,
    maxlength: [500, 'Strengths cannot exceed 500 characters']
  },
  improvements: {
    type: String,
    maxlength: [500, 'Improvements cannot exceed 500 characters']
  },
  media: [mediaSchema],
  recommendation: {
    type: String,
    enum: ['qualify', 'waitlist', 'reject'],
    default: 'waitlist'
  },
  isFinalized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

evaluationSchema.index({ team: 1, judge: 1, round: 1 }, { unique: true });
evaluationSchema.index({ hackathon: 1, round: 1 });
evaluationSchema.index({ judge: 1, createdAt: -1 });
evaluationSchema.index({ totalScore: -1 });

evaluationSchema.pre('save', function(next) {
  const weights = { innovation: 0.4, technical: 0.3, uiux: 0.2, presentation: 0.1 };
  this.weightedScore = (
    this.scores.innovation * weights.innovation +
    this.scores.technical * weights.technical +
    this.scores.uiux * weights.uiux +
    this.scores.presentation * weights.presentation
  ).toFixed(2);
  next();
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;