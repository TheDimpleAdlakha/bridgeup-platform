const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Auth middleware
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

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const newProject = new Project({ ...req.body, ngo: req.user.id });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('ngo', 'name location').sort({ date: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Platform-wide analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalUsers = await User.countDocuments();
    const allProjects = await Project.find();
    const totalFunds = allProjects.reduce((sum, p) =>
      sum + p.sponsors.reduce((s, sp) => s + (sp.amount || 0), 0), 0);
    const totalVolunteers = allProjects.reduce((sum, p) => sum + p.volunteersJoined.length, 0);
    const totalTreesPlanted = allProjects.reduce((sum, p) => sum + (p.impact?.treesPlanted || 0), 0);
    const totalPeopleHelped = allProjects.reduce((sum, p) => sum + (p.impact?.peopleHelped || 0), 0);
    res.json({ totalProjects, totalUsers, totalFunds, totalVolunteers, totalTreesPlanted, totalPeopleHelped });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Smart Recommendations for logged-in user
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.json([]);
    const allProjects = await Project.find().populate('ngo', 'name');

    // Exclude projects user already joined or created and handle orphaned projects
    const eligible = allProjects.filter(p =>
      p.ngo && p.ngo._id && p.ngo._id.toString() !== req.user.id &&
      !p.volunteersJoined.map(v => v.toString()).includes(req.user.id)
    );

    // Score each project for this user
    const scored = eligible.map(p => {
      let score = 30; // base
      if (user.location && p.location.toLowerCase().includes(user.location.toLowerCase())) score += 40;
      if (user.interests && user.interests.includes(p.category)) score += 30;
      return { project: p, score: Math.min(score, 100) };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3).map(s => ({ ...s.project.toObject(), matchScore: s.score }));
    res.json(top);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// User dashboard projects
router.get('/dashboard/my-projects', auth, async (req, res) => {
  try {
    const organized = await Project.find({ ngo: req.user.id }).populate('ngo', 'name').sort({ date: -1 });
    const joined = await Project.find({ volunteersJoined: req.user.id }).populate('ngo', 'name').sort({ date: -1 });
    const sponsored = await Project.find({
      $or: [{ 'sponsors.userId': req.user.id }, { 'sponsors.sponsorId': req.user.id }]
    }).populate('ngo', 'name').sort({ date: -1 });
    res.json({ organized, joined, sponsored });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Join project
router.post('/:id/join', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.volunteersJoined.map(v => v.toString()).includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already joined' });
    }
    project.volunteersJoined.push(req.user.id);

    // Notify organizer
    const organizer = await User.findById(project.ngo);
    if (organizer) {
      organizer.notifications.push({ message: `${req.user.name} joined your project "${project.title}"` });
      await organizer.save();
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Sponsor project
router.post('/:id/sponsor', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    project.sponsors.push({ userId: req.user.id, name: req.user.name, amount: Number(amount), thanked: false });
    project.totalFundsRaised = (project.totalFundsRaised || 0) + Number(amount);

    // Notify organizer
    const organizer = await User.findById(project.ngo);
    if (organizer) {
      organizer.notifications.push({ message: `${req.user.name} sponsored your project "${project.title}" with $${amount}!` });
      await organizer.save();
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Thank a sponsor (organizer only)
router.post('/:id/thank/:sponsorId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.ngo.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const sponsor = project.sponsors.id(req.params.sponsorId);
    if (sponsor) {
      sponsor.thanked = true;
      // Notify the sponsor user
      const sponsorUser = await User.findById(sponsor.userId);
      if (sponsorUser) {
        sponsorUser.notifications.push({
          message: `The organizer of "${project.title}" sent you a heartfelt Thank You for your $${sponsor.amount} contribution! 🙏`
        });
        await sponsorUser.save();
      }
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update impact metrics (organizer only)
router.put('/:id/impact', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.ngo.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const { treesPlanted, peopleHelped } = req.body;
    if (treesPlanted !== undefined) project.impact.treesPlanted = Number(treesPlanted);
    if (peopleHelped !== undefined) project.impact.peopleHelped = Number(peopleHelped);

    await project.save(); // impactScore auto-recalculates via pre-save hook
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get user notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.json([]);
    res.json(user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Mark all notifications as read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $set: { 'notifications.$[].read': true } });
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
