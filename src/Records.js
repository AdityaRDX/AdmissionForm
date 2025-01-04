import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Records.css';

const Records = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        // Fetch records from localStorage (or an API if applicable)
        const storedRecords = JSON.parse(localStorage.getItem('userRecords')) || [];
        setRecords(storedRecords);
    }, []);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="records-container">
            <h1>Records</h1>
            <div className="records-list">
                {records.length === 0 ? (
                    <p>No records found!</p>
                ) : (
                    records.map((record, index) => (
                        <div key={index} className="record-item">
                            {Object.entries(record).map(([key, value], idx) => (
                                <div key={idx} className="record-field">
                                    <strong>{capitalizeFirstLetter(key)}:</strong> {value}
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
            <Link to="/" className="back-home-link">Back to Home</Link>
        </div>
    );
};

export default Records;
