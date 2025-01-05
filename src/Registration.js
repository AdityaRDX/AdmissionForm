import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      photo: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First Name is required'),
      middleName: Yup.string(),
      lastName: Yup.string().required('Last Name is required'),
      mobileNumber: Yup.string()
        .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
      photo: Yup.mixed()
        .required('A photo is required')
        .test('fileFormat', 'Only JPEG, JPG, PNG formats allowed', (value) => {
          return value && ['image/jpeg', 'image/png'].includes(value.type);
        })
        .test('fileSize', 'File size must be less than 1MB', (value) => {
          return value && value.size <= 1048576;
        }),
    }),
    onSubmit: (values) => {
      localStorage.setItem('user', JSON.stringify(values));  // Save user data in local storage
      navigate('/login'); // Redirect to login page
    },
  });

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
          />
          {formik.touched.firstName && formik.errors.firstName && <div className="error">{formik.errors.firstName}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="middleName">Middle Name</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            onChange={formik.handleChange}
            value={formik.values.middleName}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
          />
          {formik.touched.lastName && formik.errors.lastName && <div className="error">{formik.errors.lastName}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number *</label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.mobileNumber}
          />
          {formik.touched.mobileNumber && formik.errors.mobileNumber && <div className="error">{formik.errors.mobileNumber}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="photo">Photo *</label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={(event) => formik.setFieldValue('photo', event.currentTarget.files[0])}
          />
          {formik.touched.photo && formik.errors.photo && <div className="error">{formik.errors.photo}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && <div className="error">{formik.errors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && <div className="error">{formik.errors.password}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="error">{formik.errors.confirmPassword}</div>}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;
