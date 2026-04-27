import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, Users, HeartHandshake } from 'lucide-react';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ textAlign: 'center', marginTop: '3rem' }}
    >
      <motion.div variants={itemVariants} style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>
          Bridge<span style={{ color: 'var(--primary)' }}>up</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto 2rem' }}>
          Connecting passionate Volunteers, dedicated Organizers, and generous Sponsors
          to collaborate on sustainable community projects.
        </p>
        <Link to="/projects" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Explore Initiatives
        </Link>
      </motion.div>

      <motion.div className="grid" variants={containerVariants}>
        <motion.div className="card glass" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
          <Users size={48} color="var(--primary)" style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 className="card-title">Volunteer</h3>
          <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Find local projects, join initiatives, and make a real difference in your community.</p>
          <Link to="/projects" className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>Browse Projects</Link>
        </motion.div>

        <motion.div className="card glass" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
          <Globe2 size={48} color="var(--primary)" style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 className="card-title">Organize</h3>
          <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Post your projects, recruit passionate volunteers, and securely receive funding.</p>
          <Link to="/create-project" className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Create Project</Link>
        </motion.div>

        <motion.div className="card glass" variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
          <HeartHandshake size={48} color="var(--primary)" style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 className="card-title">Sponsor</h3>
          <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Support meaningful initiatives financially and track the local impact you create.</p>
          <Link to="/projects" className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>Fund Projects</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
