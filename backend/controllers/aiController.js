const Report = require('../models/Report');
const User = require('../models/User');

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Builds a compact text summary of recent team reports to feed Gemini as
// context. We deliberately keep this to submitted reports only, and cap
// how much text we send, to control both cost and the risk of leaking
// draft/unsubmitted content a manager shouldn't see summarized yet.
async function buildTeamContext({ dateFrom, dateTo, project, member } = {}) {
  const filter = { status: 'submitted' };
  if (project) filter.project = project;
  if (member) filter.user = member;
  if (dateFrom || dateTo) {
    filter.weekStartDate = {};
    if (dateFrom) filter.weekStartDate.$gte = new Date(dateFrom);
    if (dateTo) filter.weekStartDate.$lte = new Date(dateTo);
  }

  const reports = await Report.find(filter)
    .populate('user', 'name')
    .populate('project', 'name')
    .sort({ weekStartDate: -1 })
    .limit(60); // keep prompt size bounded

  if (!reports.length) {
    return 'No submitted reports are available for this query.';
  }

  return reports
    .map((r) => {
      const week = `${r.weekStartDate.toISOString().slice(0, 10)} - ${r.weekEndDate
        .toISOString()
        .slice(0, 10)}`;
      return [
        `Team member: ${r.user?.name || 'Unknown'}`,
        `Project: ${r.project?.name || 'Unknown'}`,
        `Week: ${week}`,
        `Completed: ${r.tasksCompleted}`,
        `Planned next: ${r.tasksPlanned}`,
        `Blockers: ${r.blockers || 'None'}`,
        r.hoursWorked != null ? `Hours worked: ${r.hoursWorked}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n---\n');
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini API request failed';
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return text || 'No response generated.';
}

// @route  POST /api/ai/chat
// @access Private (manager only)
// Body: { question, project?, member?, dateFrom?, dateTo? }
const chatWithAssistant = async (req, res) => {
  try {
    const { question, project, member, dateFrom, dateTo } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'A question is required' });
    }

    const context = await buildTeamContext({ project, member, dateFrom, dateTo });

    const prompt = `You are an assistant helping a manager understand their team's weekly
status reports. Only use the report data provided below to answer — do not
invent information that isn't present. If the data doesn't answer the
question, say so plainly.

TEAM REPORT DATA:
${context}

MANAGER'S QUESTION:
${question}

Answer concisely, in plain prose (no markdown headers). Reference specific
team members or projects by name where relevant.`;

    const answer = await callGemini(prompt);

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error contacting AI assistant', error: error.message });
  }
};

// @route  POST /api/ai/summary
// @access Private (manager only)
// Body: { project?, member?, dateFrom?, dateTo? }
// Generates a structured team summary: completed work, recurring blockers,
// workload imbalances.
const generateTeamSummary = async (req, res) => {
  try {
    const { project, member, dateFrom, dateTo } = req.body;
    const context = await buildTeamContext({ project, member, dateFrom, dateTo });

    const prompt = `You are summarizing a team's weekly status reports for a manager.
Only use the report data below — do not invent information.

TEAM REPORT DATA:
${context}

Write a short summary (4-6 sentences) covering:
1. Notable work completed across the team
2. Any recurring blockers or challenges mentioned by multiple people
3. Any visible workload imbalance (some members/projects far busier than others)

Plain prose, no markdown headers or bullet points.`;

    const summary = await callGemini(prompt);

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating summary', error: error.message });
  }
};

module.exports = { chatWithAssistant, generateTeamSummary };