const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  category: { 
    type: String, 
    default: 'Community', 
    enum: [
      'Education', 'Health', 'Environment', 'Community', 
      'Food & Hunger', 'Donations & Relief', 'Digital Literacy', 
      'Mental Health', 'Women Empowerment', 'Animal Welfare'
    ] 
  },
  requiredVolunteers: { type: Number, required: true },
  fundingGoal: { type: Number, default: 0 },
  totalFundsRaised: { type: Number, default: 0 },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteersJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sponsors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    amount: Number,
    thanked: { type: Boolean, default: false }
  }],
  impact: {
    treesPlanted: { type: Number, default: 0 },
    peopleHelped: { type: Number, default: 0 },
  },
  impactScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate impact score before every save
ProjectSchema.pre('save', function() {
  const totalFunds = this.sponsors.reduce((sum, s) => sum + (s.amount || 0), 0);
  const volunteerScore = Math.min((this.volunteersJoined.length / Math.max(this.requiredVolunteers, 1)) * 40, 40);
  const fundScore = this.fundingGoal > 0 ? Math.min((totalFunds / this.fundingGoal) * 30, 30) : 0;
  const impactTrees = this.impact?.treesPlanted || 0;
  const impactPeople = this.impact?.peopleHelped || 0;
  const impactMetricScore = Math.min((impactTrees / 10) + (impactPeople / 5), 30);
  this.impactScore = Math.round(volunteerScore + fundScore + impactMetricScore);
});

module.exports = mongoose.model('Project', ProjectSchema);
