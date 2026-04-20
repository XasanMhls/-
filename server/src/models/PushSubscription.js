import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
}, {
  timestamps: true,
});

// Auto-expire subscriptions after 1 year of no activity
pushSubscriptionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 365 * 24 * 3600 });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
