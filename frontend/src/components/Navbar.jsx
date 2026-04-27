import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, handleLogout }) => {
  const location = useLocation();
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? '#10b981' : '#cbd5e1',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '600' : '400',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    background: isActive(path) ? 'rgba(16,185,129,0.12)' : 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem',
  });

  return (
    <nav className="navbar glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 2rem', marginBottom: '1.5rem' }}>
      {/* Brand */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🌍</span>
        <span style={{ fontWeight: '800', fontSize: '1.3rem', background: 'linear-gradient(135deg, #10b981, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BridgeUp
        </span>
      </Link>

      {/* Nav Links */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/projects" style={linkStyle('/projects')}>Projects</Link>
        <Link to="/create-project" style={linkStyle('/create-project')}>+ Create</Link>
        <Link to="/analytics" style={linkStyle('/analytics')}>Analytics</Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fb7185', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500', transition: 'all 0.2s ease' }}
          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.3)'}
          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
        >
          Logout ({user.name})
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
