import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Users, Coins, MapPin, Building2, Calendar,
  Loader2, CheckCircle2, TreePine, HeartHandshake, TrendingUp, Star,
  FolderOpen, DollarSign, Award, MessageCircle
} from 'lucide-react';
import generateCertificate from '../components/Certificate.js';

const Dashboard = ({ user }) => {
  const [data, setData] = useState({ organized: [], joined: [], sponsored: [] });
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [impactEdits, setImpactEdits] = useState({});

  const token = localStorage.getItem('token');
  const headers = { 'x-auth-token': token };

  const fetchAll = async () => {
    try {
      const ts = new Date().getTime();
      const [dashRes, analyticsRes, recRes, notifRes] = await Promise.all([
        axios.get(`/api/projects/dashboard/my-projects?t=${ts}`, { headers }),
        axios.get(`/api/projects/analytics?t=${ts}`),
        axios.get(`/api/projects/recommendations?t=${ts}`, { headers }),
        axios.get(`/api/projects/notifications?t=${ts}`, { headers }),
      ]);
      setData(dashRes.data);
      setAnalytics(analyticsRes.data);
      setRecommendations(recRes.data);
      setNotifications(notifRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);



  const handleImpactUpdate = async (projectId) => {
    try {
      await axios.put(`/api/projects/${projectId}/impact`, impactEdits[projectId] || {}, { headers });
      alert('Impact metrics updated!');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating impact');
    }
  };

  const handleMarkRead = async () => {
    await axios.put('/api/projects/notifications/read', {}, { headers });
    fetchAll();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={48} color="var(--primary)" />
        </motion.div>
      </div>
    );
  }

  const analyticsCards = analytics ? [
    { label: 'Total Projects', value: analytics.totalProjects, icon: FolderOpen, color: '#10b981' },
    { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: '#38bdf8' },
    { label: 'Funds Raised', value: `$${analytics.totalFunds.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
    { label: 'Volunteers', value: analytics.totalVolunteers, icon: HeartHandshake, color: '#a78bfa' },
  ] : [];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <LayoutDashboard size={32} color="var(--primary)" />
        <h2 style={{ marginBottom: 0 }}>My Impact Dashboard</h2>
      </div>

      {/* Welcome Card */}
      <motion.div className="card glass" variants={cardVariants} style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>👋 Welcome back, {user.name}!</h3>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>{user.email}</p>
      </motion.div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp color="#10b981" size={22} /> Platform Impact
          </h3>
          <motion.div className="grid" variants={containerVariants}>
            {analyticsCards.map((card, i) => (
              <motion.div key={i} className="card glass" variants={cardVariants} whileHover={{ scale: 1.04 }} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <card.icon size={28} color={card.color} style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.label}</p>
                <p style={{ color: card.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{card.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star color="#f59e0b" size={22} /> Recommended For You
          </h3>
          <motion.div className="grid" variants={containerVariants}>
            {recommendations.map(p => (
              <motion.div key={p._id} className="card glass" variants={cardVariants} style={{ padding: '1.5rem', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'white', margin: 0 }}>{p.title}</h4>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.matchScore}% Match</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                  <MapPin size={13} /> {p.location} &nbsp;•&nbsp; {p.category}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Organized Projects */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Target color="var(--primary)" size={22} /> Organized ({data.organized.length})
        </h3>
        {data.organized.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>You haven't created any projects yet.</p>
        ) : (
          <motion.div className="grid" variants={containerVariants}>
            {data.organized.map(p => (
              <motion.div key={p._id} className="card glass" variants={cardVariants} style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{p.title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} />{p.location} &nbsp;•&nbsp; <Calendar size={13} /> {new Date(p.date).toLocaleDateString()}
                </p>

                {/* Impact Score */}
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>Impact Score</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{p.impactScore || 0}/100</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px' }}>
                    <div style={{ width: `${p.impactScore || 0}%`, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #10b981, #38bdf8)' }} />
                  </div>
                </div>

                {/* Impact Metrics Editor */}
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Update Impact Metrics</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                        <TreePine size={12} color="#34d399" /> Trees Planted
                      </label>
                      <input
                        type="number" min="0"
                        defaultValue={p.impact?.treesPlanted || 0}
                        onChange={e => setImpactEdits(prev => ({ ...prev, [p._id]: { ...prev[p._id], treesPlanted: e.target.value } }))}
                        style={{ margin: 0, padding: '0.5rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                        <HeartHandshake size={12} color="#fb7185" /> People Helped
                      </label>
                      <input
                        type="number" min="0"
                        defaultValue={p.impact?.peopleHelped || 0}
                        onChange={e => setImpactEdits(prev => ({ ...prev, [p._id]: { ...prev[p._id], peopleHelped: e.target.value } }))}
                        style={{ margin: 0, padding: '0.5rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleImpactUpdate(p._id)}>
                    Save Impact Metrics
                  </button>
                </div>

                {/* Sponsor List */}
                {p.sponsors?.length > 0 && (
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsors</p>
                    {p.sponsors.map(sponsor => (
                      <div key={sponsor._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <div>
                          <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>{sponsor.name || 'Anonymous'}</p>
                          <p style={{ color: 'var(--success)', margin: 0, fontSize: '0.82rem', fontWeight: 'bold' }}>${sponsor.amount}</p>
                        </div>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => window.dispatchEvent(new CustomEvent('openChat', { detail: { id: sponsor.userId || sponsor._id, name: sponsor.name || 'Sponsor' } }))}
                        >
                          <MessageCircle size={14} /> Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Joined Projects */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Users color="var(--success)" size={22} /> Joined ({data.joined.length})
        </h3>
        {data.joined.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>You haven't joined any projects yet.</p>
        ) : (
          <motion.div className="grid" variants={containerVariants}>
            {data.joined.map(p => (
              <motion.div key={p._id} className="card glass" variants={cardVariants} style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{p.title}</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Building2 size={13} /> {p.ngo?.name || 'Unknown'} &nbsp;•&nbsp; <MapPin size={13} /> {p.location}
                </p>
                <button
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                  onClick={() => generateCertificate({ userName: user.name, projectName: p.title, projectDate: p.date })}
                >
                  <Award size={16} /> Download Certificate
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sponsored Projects */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Coins color="var(--accent)" size={22} /> Sponsored ({data.sponsored.length})
        </h3>
        {data.sponsored.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>You haven't sponsored any projects yet.</p>
        ) : (
          <motion.div className="grid" variants={containerVariants}>
            {data.sponsored.map(p => {
              const mySponsorship = p.sponsors?.find(s => s.userId === user.id || s.sponsorId === user.id);
              return (
                <motion.div key={p._id} className="card glass" variants={cardVariants} style={{ padding: '1.5rem' }}>
                  <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{p.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Building2 size={13} /> {p.ngo?.name || 'Unknown'} &nbsp;•&nbsp; <MapPin size={13} /> {p.location}
                  </p>
                  {mySponsorship && (
                    <p style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      Your contribution: ${mySponsorship.amount}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Notification Inbox */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
        <AnimatePresence>
          {inboxOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="card glass"
              style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '1rem', width: '320px', padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'white', margin: 0, fontSize: '1rem' }}>🔔 Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkRead} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.8rem', cursor: 'pointer' }}>Mark all read</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No notifications yet.</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} style={{ background: n.read ? 'rgba(0,0,0,0.15)' : 'rgba(16,185,129,0.08)', padding: '0.75rem', borderRadius: '8px', borderLeft: `3px solid ${n.read ? '#334155' : '#10b981'}`, marginBottom: '0.75rem' }}>
                    <p style={{ color: n.read ? '#94a3b8' : 'white', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>{n.message}</p>
                    <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setInboxOpen(!inboxOpen)}
          className="btn btn-primary"
          style={{ width: '58px', height: '58px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', fontSize: '1.5rem' }}
        >
          🔔
          {unreadCount > 0 && !inboxOpen && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '0.72rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0f172a' }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
