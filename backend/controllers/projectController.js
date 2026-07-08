const { validationResult } = require('express-validator');
const Project = require('../models/Project');

// @route  POST /api/projects
// @access Private (manager only)
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, members } = req.body;

    const existing = await Project.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'A project with this name already exists' });
    }

    const project = await Project.create({
      name,
      description,
      members: members || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating project', error: error.message });
  }
};

// @route  GET /api/projects
// @access Private (any authenticated user - members need this list to file reports)
const getProjects = async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const projects = await Project.find(filter)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects', error: error.message });
  }
};

// @route  GET /api/projects/:id
// @access Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project', error: error.message });
  }
};

// @route  PUT /api/projects/:id
// @access Private (manager only)
const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, members, isActive } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;
    if (isActive !== undefined) project.isActive = isActive;

    await project.save();

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating project', error: error.message });
  }
};

// @route  DELETE /api/projects/:id
// @access Private (manager only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};