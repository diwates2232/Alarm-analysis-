import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RawAlarms from './pages/RawAlarms';

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
          <Link to="/alarms">Raw Alarms</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alarms" element={<RawAlarms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;














import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RawAlarms from './pages/RawAlarms';

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', background: '#f0f0f0' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
          <Link to="/alarms">Raw Alarms</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alarms" element={<RawAlarms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;







