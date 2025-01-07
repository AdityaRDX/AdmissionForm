import React, { useState, useEffect } from 'react';
import Axios from 'axios'; // Import Axios
import './Records.css';

const Records = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await Axios.get('http://localhost:5000/records');
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="records-container">
      <h1>All Records</h1>
      {records.map((record, index) => (
        <div key={index} className="record-card">
          {Object.entries(record).map(([key, value]) => (
            <div className="record-field" key={key}>
              <span className="field-name">{key}:</span>
              <span className="field-value">
                {typeof value === 'string' && value.startsWith('/uploads') ? (
                  <a href={`http://localhost:5000${value}`} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                ) : (
                  value
                )}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Records;
