import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', date: '', requiredVolunteers: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/projects', formData, {
        headers: { 'x-auth-token': token }
      });
      navigate('/projects');
    } catch (err) {
      alert('Failed to create project');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box glass" style={{maxWidth: '600px'}}>
        <h2>Post a New Project</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Project Title" required onChange={handleChange} />
          <textarea name="description" placeholder="Project Description" rows="4" required onChange={handleChange} />
          <input type="text" name="location" placeholder="Location" required onChange={handleChange} />
          <input type="date" name="date" required onChange={handleChange} />
          <input type="number" name="requiredVolunteers" placeholder="Required Volunteers" required onChange={handleChange} />
          
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
