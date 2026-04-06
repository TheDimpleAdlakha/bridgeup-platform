import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Building2, Users as UsersIcon, Loader2, X } from 'lucide-react';

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fundingProject, setFundingProject] = useState(null);
  const [fundingAmount, setFundingAmount] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleJoin = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${projectId}/join`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Successfully joined the project!');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error joining project');
    }
  };

  const submitSponsorship = async (e) => {
    e.preventDefault();
    if (!fundingAmount || isNaN(fundingAmount) || Number(fundingAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${fundingProject._id}/sponsor`, { amount: Number(fundingAmount) }, {
        headers: { 'x-auth-token': token }
      });
      alert('Thank you for your sponsorship!');
      setFundingProject(null);
      setFundingAmount('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error sponsoring project');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        Available Initiatives
      </h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={48} color="var(--primary)" />
          </motion.div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            <motion.div
              className="grid"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {projects.map(p => {
                const isCreator = p.ngo?._id === user.id || p.ngo === user.id;
                return (
                <motion.div key={p._id} className="card glass" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{p.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <Building2 size={16} /> <span>Organized by {isCreator ? "You" : (p.ngo?.name || "Unknown")}</span>
                  </div>

                  <p style={{ marginBottom: '1.5rem', color: '#cbd5e1', flexGrow: 1, lineHeight: '1.6' }}>{p.description}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} color="var(--primary)" /> <span>{p.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} color="var(--primary)" /> <span>{new Date(p.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UsersIcon size={18} color="var(--primary)" />
                      <span>Volunteers: {p.volunteersJoined.length} / {p.requiredVolunteers}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`btn ${p.volunteersJoined.includes(user.id) ? 'btn-outline' : 'btn-primary'}`}
                      style={{ flex: 1, padding: '0.75rem 0.5rem' }}
                      onClick={() => handleJoin(p._id)}
                      disabled={p.volunteersJoined.includes(user.id)}
                    >
                      {p.volunteersJoined.includes(user.id) ? 'Joined' : 'Join'}
                    </button>
                    
                    <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem 0.5rem', background: 'linear-gradient(135deg, var(--success), #38bdf8)' }} onClick={() => setFundingProject(p)}>
                      Fund
                    </button>
                  </div>
                </motion.div>
              )})}

              {projects.length === 0 && (
                <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <UsersIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No projects available right now. Check back later!</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Funding Modal */ }
          <AnimatePresence>
            {fundingProject && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                onClick={() => setFundingProject(null)}
              >
                <motion.div 
                  className="card glass"
                  initial={{ y: -50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -50, opacity: 0, scale: 0.9 }}
                  style={{ width: '100%', maxWidth: '400px', cursor: 'default' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white' }}>Fund Project</h3>
                    <X size={24} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setFundingProject(null)} />
                  </div>
                  
                  <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    You are sponsoring <strong>{fundingProject.title}</strong>. Enter the amount below.
                  </p>

                  <form onSubmit={submitSponsorship}>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontWeight: 'bold' }}>$</span>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        placeholder="0.00" 
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        style={{ paddingLeft: '2rem', margin: 0 }} 
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--success), #38bdf8)' }}>
                      Confirm Sponsorship
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Projects;
