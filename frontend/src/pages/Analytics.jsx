import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, FolderOpen, DollarSign, TreePine, HeartHandshake, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/projects/analytics')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { label: 'Funds Raised', value: `$${stats.totalFunds.toLocaleString()}`, icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Volunteers', value: stats.totalVolunteers, icon: HeartHandshake, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Trees Planted', value: stats.totalTreesPlanted, icon: TreePine, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'People Helped', value: stats.totalPeopleHelped, icon: TrendingUp, color: '#fb7185', bg: 'rgba(251,113,133,0.1)' },
  ] : [];

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🌍 Platform Impact Analytics
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Real-time data on the global impact BridgeUp is driving
        </motion.p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading analytics...</p>
      ) : (
        <motion.div
          className="grid"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="card glass"
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              style={{ textAlign: 'center', padding: '2rem' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <card.icon size={32} color={card.color} />
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.label}</p>
              <p style={{ color: card.color, fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{card.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="card glass"
        style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center' }}
      >
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>🤝 About BridgeUp</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto' }}>
          BridgeUp is a community-driven platform aligned with the United Nations Sustainable Development Goal 17 —
          <strong style={{ color: '#10b981' }}> Partnerships for the Goals</strong>. We connect volunteers, NGOs, and sponsors
          to build meaningful, measurable impact projects that benefit communities around the world.
        </p>
      </motion.div>
    </div>
  );
};

export default Analytics;
