import { Link } from 'react-router-dom';

const Navbar = ({ user, handleLogout }) => {
  if (!user) return null;

  return (
    <nav className="navbar glass">
      <h2><Link to="/" style={{color: 'white', textDecoration: 'none'}}>Local Impact</Link></h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/create-project">Create Project</Link>
        <a href="#!" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout ({user.name})</a>
      </div>
    </nav>
  );
};

export default Navbar;
