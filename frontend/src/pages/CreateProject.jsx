import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'Education', 'Health', 'Environment', 'Community', 
  'Food & Hunger', 'Donations & Relief', 'Digital Literacy', 
  'Mental Health', 'Women Empowerment', 'Animal Welfare'
];

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', date: '',
    requiredVolunteers: '', fundingGoal: '', category: 'Community'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/projects', formData, { headers: { 'x-auth-token': token } });
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-box glass"
        style={{ maxWidth: '620px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>🚀 Post a New Project</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Create an initiative and bring your community together.
        </p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Project Title" required onChange={handleChange} />
          <textarea name="description" placeholder="Project Description" rows="4" required onChange={handleChange} />
          <input type="text" name="location" placeholder="Location (City, Country)" required onChange={handleChange} />
          <input type="date" name="date" required onChange={handleChange} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input type="number" name="requiredVolunteers" placeholder="Required Volunteers" required onChange={handleChange} />
            <input type="number" name="fundingGoal" placeholder="Funding Goal ($)" onChange={handleChange} />
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Project Category</label>
          <select name="category" onChange={handleChange} value={formData.category} style={{ marginBottom: '1rem' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProject;
