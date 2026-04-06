import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Target, Users, Coins, MapPin, Building2, Calendar, Loader2, CheckCircle2, MessageSquare, X } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [data, setData] = useState({ organized: [], joined: [], sponsored: [] });
  const [loading, setLoading] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/projects/dashboard/my-projects', {
        headers: { 'x-auth-token': token }
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleThankSponsor = async (projectId, sponsorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/projects/${projectId}/thank/${sponsorId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error thanking sponsor');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={48} color="var(--primary)" />
        </motion.div>
      </div>
    );
  }

  // Parse messages from backend data intelligently! 
  const messages = data.sponsored.flatMap(p => 
    p.sponsors
      .filter(s => (s.userId === user.id || s.sponsorId === user.id) && s.thanked)
      .map(s => ({
        id: s._id,
        project: p.title,
        ngo: p.ngo?.name || "The Organizer",
        amount: s.amount
      }))
  );

  const ProjectList = ({ title, items, icon: Icon, color, isOrganized }) => (
    <div style={{ marginBottom: '3rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white' }}>
        <Icon color={color} size={24} /> {title} ({items.length})
      </h3>
      
      {items.length === 0 ? (
        <p style={{ color: '#94a3b8', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          You haven't {title.toLowerCase()} any projects yet.
        </p>
      ) : (
        <motion.div className="grid" initial="hidden" animate="visible" variants={containerVariants}>
          {items.map(p => (
            <motion.div key={p._id} className="card glass" variants={cardVariants} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{p.title}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={14} /> Organized by {p.ngo?._id === user.id ? 'You' : (p.ngo?.name || "Unknown")}
              </p>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: isOrganized && p.sponsors?.length > 0 ? '1rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" /> {p.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary)" /> {new Date(p.date).toLocaleDateString()}
                </div>
              </div>

              {/* Display Sponsors if Organized array */}
              {isOrganized && p.sponsors?.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <h5 style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Sponsors</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {p.sponsors.map(sponsor => (
                      <div key={sponsor._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                        <div>
                          <p style={{ color: 'white', fontSize: '0.95rem', margin: 0 }}>{sponsor.name || 'Anonymous'}</p>
                          <p style={{ color: 'var(--success)', fontSize: '0.85rem', margin: 0, fontWeight: 'bold' }}>${sponsor.amount}</p>
                        </div>
                        {sponsor.thanked ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <CheckCircle2 size={16} /> Thanked
                          </div>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                            onClick={() => handleThankSponsor(p._id, sponsor._id)}
                          >
                            Send Thanks
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.div 
      initial="hidden" 
      animate="visible"
      variants={containerVariants}
      style={{ marginTop: '2rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <LayoutDashboard size={32} color="var(--primary)" />
        <h2 style={{ marginBottom: 0 }}>My Impact Dashboard</h2>
      </div>

      <motion.div className="card glass" variants={cardVariants} style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome back, {user.name}!
          </h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>{user.email || 'N/A'}</p>
        </div>
      </motion.div>

      <ProjectList 
        title="Organized" 
        items={data.organized} 
        icon={Target} 
        color="var(--primary)" 
        isOrganized={true}
      />

      <ProjectList 
        title="Joined" 
        items={data.joined} 
        icon={Users} 
        color="var(--success)" 
      />

      <ProjectList 
        title="Sponsored" 
        items={data.sponsored} 
        icon={Coins} 
        color="var(--accent)" 
      />

      {/* Floating Corner Message Inbox */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
        <AnimatePresence>
          {inboxOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="card glass" 
              style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '1rem', width: '320px', padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}
            >
              <h4 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} color="var(--primary)" /> Notifications
              </h4>
              {messages.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>You have no new messages right now.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                      <p style={{ color: 'white', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                        <strong>{m.ngo}</strong> sent you a huge Thank You for funding <strong>{m.project}</strong> with <span style={{ color: 'var(--success)' }}>${m.amount}</span>!
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setInboxOpen(!inboxOpen)}
          className="btn btn-primary"
          style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}
        >
          {inboxOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!inboxOpen && messages.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-color)' }}>
              {messages.length}
            </span>
          )}
        </button>
      </div>

    </motion.div>
  );
};

export default Dashboard;
