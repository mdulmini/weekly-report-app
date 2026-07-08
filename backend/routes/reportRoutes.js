const express = require('express');
const { body } = require('express-validator');
const {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
  deleteReport,
  getTeamReports,
  getSubmissionStatus,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// All report routes require login
router.use(protect);

const reportValidation = [
  body('weekStartDate').isISO8601().withMessage('Valid weekStartDate is required'),
  body('weekEndDate').isISO8601().withMessage('Valid weekEndDate is required'),
  body('project').isMongoId().withMessage('Valid project id is required'),
  body('tasksCompleted').trim().notEmpty().withMessage('Tasks completed is required'),
  body('tasksPlanned').trim().notEmpty().withMessage('Tasks planned is required'),
  body('blockers').optional().isString(),
  body('hoursWorked').optional().isFloat({ min: 0, max: 168 }),
  body('notes').optional().isString(),
];

// --- Manager / team dashboard routes (must come before /:id) ---
router.get('/team', authorize('manager'), getTeamReports);
router.get('/team/status', authorize('manager'), getSubmissionStatus);

// --- Team member's own reports ---
router.get('/me', getMyReports);
router.post('/', reportValidation, createReport);

// --- Single report by id (owner or manager, enforced in controller) ---
router.get('/:id', getReportById);
router.put(
  '/:id',
  [
    body('weekStartDate').optional().isISO8601(),
    body('weekEndDate').optional().isISO8601(),
    body('project').optional().isMongoId(),
    body('tasksCompleted').optional().trim().notEmpty(),
    body('tasksPlanned').optional().trim().notEmpty(),
    body('blockers').optional().isString(),
    body('hoursWorked').optional().isFloat({ min: 0, max: 168 }),
    body('notes').optional().isString(),
  ],
  updateReport
);
router.patch('/:id/submit', submitReport);
router.delete('/:id', deleteReport);

module.exports = router;