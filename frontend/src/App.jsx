import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/projects" element={user ? <Projects user={user} /> : <Navigate to="/auth" />} />
          <Route path="/create-project" element={user ? <CreateProject /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
