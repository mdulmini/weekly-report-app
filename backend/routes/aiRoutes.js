const express = require('express');
const { chatWithAssistant, generateTeamSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect, authorize('manager'));

router.post('/chat', chatWithAssistant);
router.post('/summary', generateTeamSummary);

module.exports = router;