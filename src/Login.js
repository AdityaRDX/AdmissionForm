import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      Swal.fire({
        title: 'Error!',
        text: 'No registered user found. Please register first.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (user.email === e.target.username.value && user.password === e.target.password.value && enteredCaptcha === captcha) {
      Swal.fire({
        title: 'Success!',
        text: 'Login successful! Redirecting...',
        icon: 'success',
        timer: 2000, // Show for 2 seconds before navigating
        showConfirmButton: false,
      }).then(() => {
        navigate('/aform'); // Redirect to the form page if login is successful
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid credentials or captcha. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      setShowError(true); // Optional: keep the error state
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username(Enter Email ID) *</label>
          <input type="text" id="username" name="username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input type="password" id="password" name="password" required />
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
    </div>
  );
};

export default Login;
