const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// All project routes require login
router.use(protect);

// Any authenticated user can list/view projects (members need this to file reports)
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Only managers can create, edit, or delete projects/categories
router.post(
  '/',
  authorize('manager'),
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().isString(),
    body('members').optional().isArray(),
  ],
  createProject
);

router.put(
  '/:id',
  authorize('manager'),
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('description').optional().isString(),
    body('members').optional().isArray(),
    body('isActive').optional().isBoolean(),
  ],
  updateProject
);

router.delete('/:id', authorize('manager'), deleteProject);

module.exports = router;