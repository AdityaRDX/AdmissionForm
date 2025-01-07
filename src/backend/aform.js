const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/admission_db', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a schema for your records
const recordSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    middleName: String,
    lastName: String,
    mobileNumber: String,
    email: String,
    password: String,
    photo: String // Or use an array of strings if multiple files can be uploaded
});

const Record = mongoose.model('Record', recordSchema);

// File upload handling
const upload = multer({ dest: 'uploads/' });

// Submit a new record
app.post('/submit', upload.any(), async (req, res) => {
    try {
        const newRecord = new Record({
            ...req.body,
        });

        // Attach uploaded files (if any)
        req.files.forEach((file) => {
            newRecord[file.fieldname] = file.path;
        });

        await newRecord.save();
        res.send('Record added successfully!');
    } catch (error) {
        res.status(500).send('Error submitting record');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
