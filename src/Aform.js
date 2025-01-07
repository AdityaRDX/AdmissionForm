import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { saveAs } from 'file-saver';
import {Link} from 'react-router-dom';
import Axios from 'axios';
import Swal from 'sweetalert2';
import { districtTalukaData } from './districtTalukaData';
import './AForm.css';

function AForm() {
    const [records, setRecords] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [talukas, setTalukas] = useState([]);
    const [titleOptions, setTitleOptions] = useState(['Mr.', 'Ms.', 'Dr.']);

    useEffect(() => {
        fetchRecords();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: '',
            motherName: '',
            gender: '',
            address: '',
            taluka: '',
            district: '',
            pinCode: '',
            state: 'Maharashtra',
            mobileNumber: '',
            emailId: '',
            aadhaarNumber: '',
            dob: '',
            age: '',
            religion: '',
            casteCategory: '',
            caste: '',
            physicallyHandicapped: '',
            casteCertificate: null,
            marksheet: null,
            photo: null,
            signature: null,
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            firstName: Yup.string().matches(/^[A-Za-z\s]+$/, 'First Name should contain only letters and spaces').required('First Name is required'),
            middleName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Middle Name should contain only letters and spaces').required('Middle Name is required'),
            lastName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Last Name should contain only letters and spaces').required('Last Name is required'),
            motherName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Mother Name should contain only letters and spaces').required("Mother's Name is required"),
            gender: Yup.string().required('Gender is required'),
            address: Yup.string().required('Address is required'),
            taluka: Yup.string().required('Taluka is required'),
            district: Yup.string().required('District is required'),
            pinCode: Yup.string().matches(/^[0-9]{6}$/, 'Invalid Pin Code').required('Pin Code is required'),
            mobileNumber: Yup.string().matches(/^[6-9]\d{9}$/, 'Must be a valid 10-digit number starting with 6, 7, 8, or 9').required('Mobile Number is required'),
            emailId: Yup.string().email('Invalid Email Address').required('Email is required'),
            aadhaarNumber: Yup.string().matches(/^[0-9]{12}$/, 'Invalid Aadhaar Number').required('Aadhaar Number is required'),
            dob: Yup.date().required('Date of Birth is required'),
            religion: Yup.string().required('Religion is required'),
            casteCategory: Yup.string().required('Caste Category is required'),
            caste: Yup.string().required('Caste is required'),
            physicallyHandicapped: Yup.string().required('Please select an option'),
            casteCertificate: Yup.mixed().required('Caste certificate is required'),
            marksheet: Yup.mixed().required('Marksheet is required'),
            photo: Yup.mixed().required('Photo is required'),
            signature: Yup.mixed().required('Signature is required'),
        }),
        onSubmit: async (values) => {
            const data = new FormData();
            for (const key in values) {
                if (key === 'casteCertificate' || key === 'marksheet' || key === 'photo' || key === 'signature') {
                    data.append(key, values[key]);
                } else {
                    data.append(key, values[key]);
                }
            }

            try {
                const url = editingId ? `http://localhost:5000/update/${editingId}` : 'http://localhost:5000/submit';
                const method = editingId ? 'put' : 'post';
                await Axios[method](url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                Swal.fire('Success!', editingId ? 'Record updated successfully!' : 'Form submitted successfully!', 'success');
                fetchRecords();
                formik.resetForm();
                setEditingId(null);
            } catch (error) {
                Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
            }
        },
    });

    const fetchRecords = async () => {
        try {
            const response = await Axios.get('http://localhost:5000/records');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        formik.setValues(record);
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirm.isConfirmed) {
            try {
                await Axios.delete(`http://localhost:5000/delete/${id}`);
                Swal.fire('Deleted!', 'The record has been deleted.', 'success');
                fetchRecords();
            } catch (error) {
                Swal.fire('Error!', 'Failed to delete the record.', 'error');
            }
        }
    };

    const handleDistrictChange = (e) => {
        formik.setFieldValue('district', e.target.value);
        formik.setFieldValue('taluka', '');
        setTalukas(districtTalukaData[e.target.value] || []);
    };

    const handleGenderChange = (e) => {
        formik.setFieldValue('gender', e.target.value);
        formik.setFieldValue('title', e.target.value === 'Male' ? 'Mr.' : e.target.value === 'Female' ? 'Ms.' : '');
    };

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (formik.values.dob) {
            formik.setFieldValue('age', calculateAge(formik.values.dob));
        }
        formik.setFieldValue('fullName', `${formik.values.firstName} ${formik.values.middleName} ${formik.values.lastName}`);
    }, [formik.values.firstName, formik.values.middleName, formik.values.lastName, formik.values.dob]);

    const exportToExcel = async () => {
        try {
            const response = await Axios.get('http://localhost:5000/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'records.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            Swal.fire('Error!', 'Failed to export records.', 'error');
        }
    };

    return (
        <div className="form-container">
            <h1>Admission Form</h1>
            <form onSubmit={formik.handleSubmit}>
                <label>Title:</label>
                <select name="title" value={formik.values.title} onChange={formik.handleChange}>
                    <option value="">Select Title</option>
                    {titleOptions.map((title) => (
                        <option key={title} value={title}>{title}</option>
                    ))}
                </select>
                {formik.touched.title && formik.errors.title && <div>{formik.errors.title}</div>}

                <label>First Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.firstName && formik.errors.firstName && <div>{formik.errors.firstName}</div>}

                <label>Middle Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.middleName && formik.errors.middleName && <div>{formik.errors.middleName}</div>}

                <label>Last Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.lastName && formik.errors.lastName && <div>{formik.errors.lastName}</div>}
                <label>Full Name </label>
                <input
                    type="text"
                    name="fullName"
                    placeholder='Autofield'
                    value={formik.values.fullName}
                    readOnly
                />

                <label>Mother's Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="motherName"
                    value={formik.values.motherName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.motherName && formik.errors.motherName && <div>{formik.errors.motherName}</div>}

                <label>Gender <span style={{ color: 'red' }}>*</span></label>
                <select name="gender" value={formik.values.gender} onChange={handleGenderChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                {formik.touched.gender && formik.errors.gender && <div>{formik.errors.gender}</div>}

                <label>Address <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.address && formik.errors.address && <div>{formik.errors.address}</div>}

                <label>District <span style={{ color: 'red' }}>*</span></label>
                <select name="district" value={formik.values.district} onChange={handleDistrictChange}>
                    <option value="">Select District</option>
                    {Object.keys(districtTalukaData).map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
                {formik.touched.district && formik.errors.district && <div>{formik.errors.district}</div>}

                <label>Taluka <span style={{ color: 'red' }}>*</span></label>
                <select name="taluka" value={formik.values.taluka} onChange={formik.handleChange}>
                    <option value="">Select Taluka</option>
                    {talukas.map((taluka) => (
                        <option key={taluka} value={taluka}>{taluka}</option>
                    ))}
                </select>
                {formik.touched.taluka && formik.errors.taluka && <div>{formik.errors.taluka}</div>}

                <label>Pin Code <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="pinCode"
                    value={formik.values.pinCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.pinCode && formik.errors.pinCode && <div>{formik.errors.pinCode}</div>}

                <label>Mobile Number <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="mobileNumber"
                    value={formik.values.mobileNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.mobileNumber && formik.errors.mobileNumber && <div>{formik.errors.mobileNumber}</div>}

                <label>Email <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="emailId"
                    value={formik.values.emailId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.emailId && formik.errors.emailId && <div>{formik.errors.emailId}</div>}

                <label>Aadhaar Number <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="aadhaarNumber"
                    value={formik.values.aadhaarNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.aadhaarNumber && formik.errors.aadhaarNumber && <div>{formik.errors.aadhaarNumber}</div>}

                <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="date"
                    name="dob"
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.dob && formik.errors.dob && <div>{formik.errors.dob}</div>}

                <label>Religion <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="religion"
                    value={formik.values.religion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.religion && formik.errors.religion && <div>{formik.errors.religion}</div>}

                <label>Caste Category <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="casteCategory"
                    value={formik.values.casteCategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.casteCategory && formik.errors.casteCategory && <div>{formik.errors.casteCategory}</div>}

                <label>Caste <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="caste"
                    value={formik.values.caste}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.caste && formik.errors.caste && <div>{formik.errors.caste}</div>}

                <label>Physically Handicapped <span style={{ color: 'red' }}>*</span></label>
                <select name="physicallyHandicapped" value={formik.values.physicallyHandicapped} onChange={formik.handleChange}>
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
                {formik.touched.physicallyHandicapped && formik.errors.physicallyHandicapped && <div>{formik.errors.physicallyHandicapped}</div>}

                {/* File Uploads */}
                <label>Caste Certificate <span style={{ color: 'red' }}>*</span></label>
                <input type="file" name="casteCertificate" onChange={(e) => formik.setFieldValue('casteCertificate', e.target.files[0])} />
                {formik.touched.casteCertificate && formik.errors.casteCertificate && <div>{formik.errors.casteCertificate}</div>}

                <label>Marksheet <span style={{ color: 'red' }}>*</span></label>
                <input type="file" name="marksheet" onChange={(e) => formik.setFieldValue('marksheet', e.target.files[0])} />
                {formik.touched.marksheet && formik.errors.marksheet && <div>{formik.errors.marksheet}</div>}

                <label>Photo <span style={{ color: 'red' }}>*</span></label>
                <input type="file" name="photo" onChange={(e) => formik.setFieldValue('photo', e.target.files[0])} />
                {formik.touched.photo && formik.errors.photo && <div>{formik.errors.photo}</div>}

                <label>Signature <span style={{ color: 'red' }}>*</span></label>
                <input type="file" name="signature" onChange={(e) => formik.setFieldValue('signature', e.target.files[0])} />
                {formik.touched.signature && formik.errors.signature && <div>{formik.errors.signature}</div>}

                <button type="submit">Submit</button>
            </form>

            <button onClick={exportToExcel}>Export to Excel</button>
            <br/>

            <h2>Records</h2>
            <div className="records-table">
            <table border="1">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Last Name</th>
                        <th>Full Name</th>
                        <th>Mother Name</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Taluka</th>
                        <th>District</th>
                        <th>Pin Code</th>
                        <th>Mobile Number</th>
                        <th>Email</th>
                        <th>Aadhaar Number</th>
                        <th>Date of Birth</th>
                        <th>Age</th>
                        <th>Religion</th>
                        <th>Caste Category</th>
                        <th>Caste</th>
                        <th>Physically Handicapped</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td>{record.title}</td>
                            <td>{record.firstName}</td>
                            <td>{record.middleName}</td>
                            <td>{record.lastName}</td>
                            <td>{record.fullName}</td>
                            <td>{record.motherName}</td>
                            <td>{record.gender}</td>
                            <td>{record.address}</td>
                            <td>{record.taluka}</td>
                            <td>{record.district}</td>
                            <td>{record.pinCode}</td>
                            <td>{record.mobileNumber}</td>
                            <td>{record.emailId}</td>
                            <td>{record.aadhaarNumber}</td>
                            <td>{record.dob}</td>
                            <td>{record.age}</td>
                            <td>{record.religion}</td>
                            <td>{record.casteCategory}</td>
                            <td>{record.caste}</td>
                            <td>{record.physicallyHandicapped}</td>
                            <td>
                                <button onClick={() => handleEdit(record)}>Edit</button>
                                <button onClick={() => handleDelete(record._id)}>Delete</button>
                                <button><Link to="/records">View Records</Link></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default AForm;