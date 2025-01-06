const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload handling
const upload = multer({ dest: 'uploads/' });

// Path for the JSON file to store records
const DATA_FILE = 'data.json';

// Helper function to read records from the JSON file
const readRecords = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Helper function to write records to the JSON file
const writeRecords = (records) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
};

// Fetch all records
app.get('/records', (req, res) => {
    const records = readRecords();
    res.json(records);
});

// Submit a new record
app.post('/submit', upload.any(), (req, res) => {
    const records = readRecords();

    // Assign a new ID
    const newRecord = {
        id: records.length ? records[records.length - 1].id + 1 : 1,
        ...req.body,
    };

    // Attach uploaded files (if any)
    req.files.forEach((file) => {
        newRecord[file.fieldname] = file.path;
    });

    records.push(newRecord);
    writeRecords(records);

    res.send('Record added successfully!');
});

// Update an existing record
app.put('/update/:id', upload.any(), (req, res) => {
    console.log('PUT request received:', req.params, req.body);

    const records = readRecords();
    const id = parseInt(req.params.id, 10);
    const recordIndex = records.findIndex((record) => record.id === id);

    if (recordIndex === -1) {
        console.log('Record not found!');
        return res.status(404).send('Record not found!');
    }

    const updatedRecord = { ...records[recordIndex], ...req.body };

    req.files.forEach((file) => {
        updatedRecord[file.fieldname] = file.path;
    });

    records[recordIndex] = updatedRecord;
    writeRecords(records);

    console.log('Record updated successfully:', updatedRecord);
    res.send('Record updated successfully!');
});


// Delete a record
app.delete('/delete/:id', (req, res) => {
    const records = readRecords();
    const id = parseInt(req.params.id, 10);

    const newRecords = records.filter((record) => record.id !== id);

    if (records.length === newRecords.length) {
        return res.status(404).send('Record not found!');
    }

    writeRecords(newRecords);
    res.send('Record deleted successfully!');
});

// Export records to Excel
app.get('/export', (req, res) => {
    const records = readRecords();

    // Convert records to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(records);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Records');

    const filePath = path.join(__dirname, 'records.xlsx');
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'records.xlsx', (err) => {
        if (err) {
            console.error('Error exporting to Excel:', err);
        }

        // Delete the file after sending it to the client
        fs.unlinkSync(filePath);
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});