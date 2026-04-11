import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Round name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  qualificationThreshold: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  judgingCriteria: {
    innovation: { type: Number, default: 40 },
    technical: { type: Number, default: 30 },
    uiux: { type: Number, default: 20 },
    presentation: { type: Number, default: 10 }
  },
  maxScore: {
    type: Number,
    default: 40
  }
}, {
  timestamps: true
});

roundSchema.index({ hackathon: 1, order: 1 });

const Round = mongoose.model('Round', roundSchema);
export default Round;