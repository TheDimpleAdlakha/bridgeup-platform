const express = require('express');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    const newProject = new Project({
      ...req.body,
      ngo: req.user.id
    });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('ngo', 'name').sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.volunteersJoined.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already joined' });
    }
    project.volunteersJoined.push(req.user.id);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/:id/sponsor', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    
    project.sponsors.push({ userId: req.user.id, name: req.user.name, amount, thanked: false });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Thank you endpoint
router.post('/:id/thank/:sponsorId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    
    // Ensure only the organizer can send a thank you
    if (project.ngo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const sponsor = project.sponsors.id(req.params.sponsorId);
    if(sponsor) {
      sponsor.thanked = true;
    }
    
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// User-specific dashboard projects
router.get('/dashboard/my-projects', auth, async (req, res) => {
  try {
    const organized = await Project.find({ ngo: req.user.id }).populate('ngo', 'name').sort({ date: -1 });
    const joined = await Project.find({ volunteersJoined: req.user.id }).populate('ngo', 'name').sort({ date: -1 });
    // Using $or for backwards compatibility with old records using sponsorId
    const sponsored = await Project.find({ 
      $or: [
        { 'sponsors.userId': req.user.id },
        { 'sponsors.sponsorId': req.user.id }
      ]
    }).populate('ngo', 'name').sort({ date: -1 });
    
    res.json({ organized, joined, sponsored });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
