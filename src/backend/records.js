const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/admission_db', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const PORT = 3000;

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
    photo: String
});

const Record = mongoose.model('Record', recordSchema);

// Fetch all records
app.get('/records', async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (error) {
        res.status(500).send('Error fetching records');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
