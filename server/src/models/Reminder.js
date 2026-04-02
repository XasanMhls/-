import mongoose from 'mongoose';

const triggerHistorySchema = new mongoose.Schema(
  {
    triggeredAt: { type: Date, required: true },
    method: { type: String, enum: ['scheduled', 'manual', 'snooze'], default: 'scheduled' },
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    guestName: {
      type: String,
      trim: true,
      maxlength: [80, 'Guest name must be at most 80 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be at most 1000 characters'],
      default: '',
    },
    remindAt: {
      type: Date,
      required: [true, 'Reminder time is required'],
      index: true,
    },
    language: {
      type: String,
      enum: ['uz', 'ru', 'en', 'auto'],
      default: 'auto',
    },
    voiceEnabled: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    sound: {
      type: String,
      enum: ['bell', 'chime', 'pulse', 'notification', 'none'],
      default: 'chime',
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'none',
    },
    repeatInterval: {
      // for 'custom': number of minutes
      type: Number,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    colorTag: {
      type: String,
      enum: ['violet', 'blue', 'green', 'amber', 'red', 'pink', 'none'],
      default: 'none',
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    snoozeUntil: {
      type: Date,
      default: null,
    },
    triggerHistory: {
      type: [triggerHistorySchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    templateId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
reminderSchema.index({ user: 1, remindAt: 1 });
reminderSchema.index({ user: 1, isCompleted: 1, remindAt: 1 });
reminderSchema.index({ user: 1, isPinned: 1, remindAt: 1 });

// Virtual: is overdue
reminderSchema.virtual('isOverdue').get(function () {
  if (this.isCompleted) return false;
  const effective = this.snoozeUntil || this.remindAt;
  return effective < new Date();
});

reminderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model('Reminder', reminderSchema);
