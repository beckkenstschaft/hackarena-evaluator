import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_login',
      'user_logout',
      'team_registered',
      'team_updated',
      'evaluation_submitted',
      'round_created',
      'judge_assigned',
      'hackathon_created',
      'hackathon_updated',
      'export_data',
      'team_qualified'
    ]
  },
  entityType: {
    type: String,
    enum: ['user', 'team', 'evaluation', 'round', 'hackathon']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ hackathon: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;