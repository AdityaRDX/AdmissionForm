import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaString = '';
    for (let i = 0; i < 6; i++) {
      captchaString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(captchaString);
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if CAPTCHA matches
    if (enteredCaptcha !== captcha) {
      Swal.fire({
        title: 'Error!',
        text: 'Captcha does not match. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const response = await Axios.post('http://localhost:5000/login', {
        email: loginData.email,
        password: loginData.password,
      });

      Swal.fire('Success!', response.data.message, 'success');
      // On successful login, redirect to AForm page
      navigate('/aform');
    } catch (error) {
      Swal.fire('Error!', 'Invalid credentials or network issue. Please try again.', 'error');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="captcha">Captcha *</label>
          <input
            type="text"
            id="captcha"
            name="captcha"
            value={enteredCaptcha}
            onChange={(e) => setEnteredCaptcha(e.target.value)}
            required
          />
          <div className="captcha">{captcha}</div>
        </div>
        <button type="submit">Login</button>
      </form>
      {showError && (
        <div className="error-message">
          Invalid credentials or CAPTCHA. Please try again.
        </div>
      )}
    </div>
  );
};

export default Login;
