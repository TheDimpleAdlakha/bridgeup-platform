const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  requiredVolunteers: { type: Number, required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteersJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sponsors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    amount: Number,
    thanked: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
