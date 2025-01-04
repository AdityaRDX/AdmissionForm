import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import AForm from './Aform';
import Records from './Records';
import './App.css';


function App() {
  return (
    <Router>
            <nav>
                <Link to="/">Home</Link> | <Link to="/records">Show Records</Link>
            </nav>
            <Routes>
                <Route path="/" element={<AForm />} />
                <Route path="/records" element={<Records />} />
            </Routes>
        </Router>
  );
}

export default App;
