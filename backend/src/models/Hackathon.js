import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hackathon name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tracks: [{
    type: String,
    trim: true
  }],
  coverImage: {
    type: String
  },
  rules: {
    type: String,
    maxlength: [5000, 'Rules cannot exceed 5000 characters']
  },
  prizes: [{
    place: Number,
    title: String,
    amount: Number,
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

hackathonSchema.index({ name: 'text', description: 'text' });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;