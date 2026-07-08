const mongoose = require('mongoose');

// IMPORTANT: this field set is intentionally fixed and identical for every
// user (per the assignment spec) so reports stay comparable across the team.
// Do not let the frontend add/remove/reorder fields per-user.
const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project/category tag is required'],
    },
    tasksCompleted: {
      type: String,
      required: [true, 'Tasks completed is required'],
    },
    tasksPlanned: {
      type: String,
      required: [true, 'Tasks planned for next week is required'],
    },
    blockers: {
      type: String,
      default: '',
    },
    hoursWorked: {
      type: Number,
      min: 0,
      max: 168, // sanity cap: hours in a week
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// A user should only have one report per project per week
reportSchema.index({ user: 1, project: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);