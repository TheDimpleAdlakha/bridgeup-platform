import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Building2, Users as UsersIcon, Loader2, X, Search, Tag, Zap, MessageCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Education', 'Health', 'Environment', 'Community', 'Food & Hunger', 'Donations & Relief', 'Digital Literacy', 'Mental Health', 'Women Empowerment', 'Animal Welfare'];

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fundingProject, setFundingProject] = useState(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  useEffect(() => { fetchProjects(); }, []);



  const handleJoin = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${projectId}/join`, {}, { headers: { 'x-auth-token': token } });
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

  // Compute match score for a project vs user
  const getMatchScore = (project) => {
    let score = 30;
    if (user.location && project.location?.toLowerCase().includes(user.location?.toLowerCase())) score += 40;
    if (user.interests && user.interests.includes(project.category)) score += 30;
    return Math.min(score, 100);
  };

  const filtered = projects.filter(p => {
    const locMatch = p.location?.toLowerCase().includes(searchLocation.toLowerCase());
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return locMatch && catMatch;
  });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>🌐 Available Initiatives</h2>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Filter by location..."
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
            style={{ paddingLeft: '2.75rem', margin: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Loader2 size={48} color="var(--primary)" />
          </motion.div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            <motion.div className="grid" initial="hidden" animate="visible" variants={containerVariants}>
              {filtered.map(p => {
                const isCreator = p.ngo?._id === user.id || p.ngo === user.id;
                const totalFunds = p.totalFundsRaised || 0;
                const fundingPercent = p.fundingGoal > 0 ? Math.min((totalFunds / p.fundingGoal) * 100, 100) : 0;
                const matchScore = getMatchScore(p);
                const alreadyJoined = p.volunteersJoined?.map(v => v.toString()).includes(user.id);

                return (
                  <motion.div key={p._id} className="card glass" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Top badges row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Tag size={12} /> {p.category || 'Community'}
                      </span>
                      <span style={{ background: matchScore >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.1)', color: matchScore >= 70 ? '#10b981' : '#94a3b8', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                        <Zap size={12} /> {matchScore}% Match
                      </span>
                    </div>

                    <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{p.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <Building2 size={14} /> <span>by {isCreator ? 'You' : (p.ngo?.name || 'Unknown')}</span>
                    </div>
                    <p style={{ marginBottom: '1rem', color: '#cbd5e1', flexGrow: 1, lineHeight: '1.6', fontSize: '0.95rem' }}>{p.description}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="var(--primary)" /> {p.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="var(--primary)" /> {new Date(p.date).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UsersIcon size={14} color="var(--primary)" />
                        {p.volunteersJoined?.length || 0} / {p.requiredVolunteers} Volunteers
                      </div>
                    </div>

                    {/* Impact Score */}
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span>Impact Score</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{p.impactScore || 0}/100</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.impactScore || 0}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }}
                        />
                      </div>
                    </div>

                    {/* Funding Progress */}
                    {p.fundingGoal > 0 && (
                      <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                          <span>💰 Funding Progress</span>
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>${totalFunds.toLocaleString()} / ${p.fundingGoal.toLocaleString()}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '8px' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fundingPercent}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.65rem 0.5rem', opacity: alreadyJoined ? 0.5 : 1 }}
                        onClick={() => handleJoin(p._id)}
                        disabled={alreadyJoined}
                      >
                        {alreadyJoined ? '✓ Joined' : 'Join'}
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.65rem 0.5rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                        onClick={() => setFundingProject(p)}
                      >
                        Fund 💰
                      </button>
                    </div>
                    {/* Message Organizer Button */}
                    {!isCreator && (
                      <button
                        className="btn btn-outline"
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={() => window.dispatchEvent(new CustomEvent('openChat', { detail: { id: p.ngo._id || p.ngo, name: p.ngo.name || 'Organizer' } }))}
                      >
                        <MessageCircle size={16} /> Message Organizer
                      </button>
                    )}
                  </motion.div>
                );
              })}

              {filtered.length === 0 && !loading && (
                <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <UsersIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                  <p>No projects match your filters. Try adjusting your search!</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Funding Modal */}
          <AnimatePresence>
            {fundingProject && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                onClick={() => setFundingProject(null)}
              >
                <motion.div
                  className="card glass"
                  initial={{ y: -40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -40, opacity: 0, scale: 0.9 }}
                  style={{ width: '100%', maxWidth: '420px', cursor: 'default' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>💰 Fund Project</h3>
                    <X size={22} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setFundingProject(null)} />
                  </div>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    You're sponsoring <strong style={{ color: 'white' }}>{fundingProject.title}</strong>. Enter the amount below.
                  </p>
                  <form onSubmit={submitSponsorship}>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold', fontSize: '1.1rem' }}>$</span>
                      <input type="number" required min="1" placeholder="0.00" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} style={{ paddingLeft: '2.2rem', margin: 0 }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                      Confirm Sponsorship 🎉
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
