const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');

// @route  POST /api/reports
// @access Private (member - creates their own report)
const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      weekStartDate,
      weekEndDate,
      project,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    const report = await Report.create({
      user: req.user._id,
      weekStartDate,
      weekEndDate,
      project,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
      status: 'draft',
    });

    res.status(201).json({ report });
  } catch (error) {
    // Duplicate key error = already has a report for this project/week
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A report for this project and week already exists. Edit it instead.',
      });
    }
    res.status(500).json({ message: 'Server error creating report', error: error.message });
  }
};

// @route  GET /api/reports/me
// @access Private (member - own history)
// Optional query params: project, weekStartDate
const getMyReports = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.project) filter.project = req.query.project;
    if (req.query.weekStartDate) filter.weekStartDate = new Date(req.query.weekStartDate);

    const reports = await Report.find(filter)
      .populate('project', 'name')
      .sort({ weekStartDate: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reports', error: error.message });
  }
};

// @route  GET /api/reports/:id
// @access Private (owner or manager)
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('project', 'name')
      .populate('user', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching report', error: error.message });
  }
};

// @route  PUT /api/reports/:id
// @access Private (owner only - can edit before or after submission)
const updateReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reports' });
    }

    const editableFields = [
      'weekStartDate',
      'weekEndDate',
      'project',
      'tasksCompleted',
      'tasksPlanned',
      'blockers',
      'hoursWorked',
      'notes',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    await report.save();

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating report', error: error.message });
  }
};

// @route  PATCH /api/reports/:id/submit
// @access Private (owner only)
const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only submit your own reports' });
    }

    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting report', error: error.message });
  }
};

// @route  DELETE /api/reports/:id
// @access Private (owner only)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    await report.deleteOne();

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting report', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// MANAGER / TEAM DASHBOARD ENDPOINTS
// ---------------------------------------------------------------------------

// @route  GET /api/reports/team
// @access Private (manager only)
// Query params: member (userId), project (projectId), weekStartDate,
//               dateFrom, dateTo
const getTeamReports = async (req, res) => {
  try {
    const { member, project, weekStartDate, dateFrom, dateTo } = req.query;

    const filter = {};
    if (member) filter.user = member;
    if (project) filter.project = project;
    if (weekStartDate) filter.weekStartDate = new Date(weekStartDate);
    if (dateFrom || dateTo) {
      filter.weekStartDate = filter.weekStartDate || {};
      if (dateFrom) filter.weekStartDate.$gte = new Date(dateFrom);
      if (dateTo) filter.weekStartDate.$lte = new Date(dateTo);
    }

    const reports = await Report.find(filter)
      .populate('user', 'name email')
      .populate('project', 'name')
      .sort({ weekStartDate: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching team reports', error: error.message });
  }
};

// @route  GET /api/reports/team/status?weekStartDate=YYYY-MM-DD
// @access Private (manager only)
// Returns submitted / pending / late status for every team member for a
// given week.
const getSubmissionStatus = async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    if (!weekStartDate) {
      return res.status(400).json({ message: 'weekStartDate query param is required' });
    }

    const weekStart = new Date(weekStartDate);
    // Assume the reporting week is "late" if today is more than 2 days past
    // the week's end (weekStart + 7 days). This is a simple, documentable
    // business rule you can adjust in your presentation.
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const lateThreshold = new Date(weekEnd);
    lateThreshold.setDate(lateThreshold.getDate() + 2);
    const isPastLateThreshold = new Date() > lateThreshold;

    const members = await User.find({ role: 'member' }).select('name email');
    const reportsThisWeek = await Report.find({ weekStartDate: weekStart }).populate(
      'user',
      'name email'
    );

    const reportByUserId = {};
    reportsThisWeek.forEach((r) => {
      reportByUserId[r.user._id.toString()] = r;
    });

    const statusList = members.map((m) => {
      const report = reportByUserId[m._id.toString()];
      let status;
      if (report && report.status === 'submitted') {
        status = 'submitted';
      } else if (isPastLateThreshold) {
        status = 'late';
      } else {
        status = 'pending';
      }
      return {
        userId: m._id,
        name: m.name,
        email: m.email,
        status,
        reportId: report ? report._id : null,
      };
    });

    res.status(200).json({ weekStartDate: weekStart, statusList });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching submission status', error: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
  deleteReport,
  getTeamReports,
  getSubmissionStatus,
};