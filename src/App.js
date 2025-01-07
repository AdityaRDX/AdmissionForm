import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import AForm from './Aform';
import Records from './Records';
import './App.css';
import Registration from './Registration';
import Login from './Login';


function App() {
  return (
    <Router>
            
            <Routes>
                <Route path="/" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/aform" element={<AForm />} />
                <Route path="/records" element={<Records />} />
            </Routes>
        </Router>
  );
}

export default App;