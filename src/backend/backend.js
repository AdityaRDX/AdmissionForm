const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const path = require('path');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/admission_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Define schemas for User and Record
const userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    middleName: String,
    lastName: String,
    mobileNumber: String,
    email: { type: String, unique: true },
    password: String,
    photo: String,
});

const recordSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    firstName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    fullName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    taluka: { type: String, default: '' },
    district: { type: String, default: '' },
    pinCode: { type: String, default: '' },
    state: { type: String, default: 'Maharashtra' },
    mobileNumber: { type: String, default: '' },
    emailId: { type: String, default: '' },
    aadhaarNumber: { type: String, default: '' },
    dob: { type: Date, default: null },
    age: { type: Number, default: 0 },
    religion: { type: String, default: '' },
    casteCategory: { type: String, default: '' },
    caste: { type: String, default: '' },
    physicallyHandicapped: { type: String, default: '' },
    casteCertificate: { type: String, default: null },
    marksheet: { type: String, default: null },
    photo: { type: String, default: null },
    signature: { type: String, default: null },
    username: { type: String, default: '' },
    email: { type: String, unique: true, default: '' },
    password: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);
const Record = mongoose.model('Record', recordSchema);

// User Registration Route
app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { username, firstName, middleName, lastName, mobileNumber, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({
            username,
            firstName,
            middleName,
            lastName,
            mobileNumber,
            email,
            password: hashedPassword,
            photo: req.file ? req.file.path : null,
        });

        await newUser.save();
        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Fetch all records Route
app.get('/records', async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (error) {
        res.status(500).send('Error fetching records');
    }
});

// Submit a new record Route
app.post('/submit', upload.any(), async (req, res) => {
    try {
        const newRecord = new Record({
            title: req.body.title,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            fullName: `${req.body.firstName} ${req.body.middleName} ${req.body.lastName}`,
            motherName: req.body.motherName,
            gender: req.body.gender,
            address: req.body.address,
            taluka: req.body.taluka,
            district: req.body.district,
            pinCode: req.body.pinCode,
            state: req.body.state || 'Maharashtra',
            mobileNumber: req.body.mobileNumber,
            emailId: req.body.emailId,
            aadhaarNumber: req.body.aadhaarNumber,
            dob: req.body.dob,
            age: new Date().getFullYear() - new Date(req.body.dob).getFullYear(),
            religion: req.body.religion,
            casteCategory: req.body.casteCategory,
            caste: req.body.caste,
            physicallyHandicapped: req.body.physicallyHandicapped,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        // Attach uploaded files (if any)
        req.files.forEach((file) => {
            newRecord[file.fieldname] = file.path;
        });

        await newRecord.save();
        res.send('Record added successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting record');
    }
});

// Update an existing record Route
app.put('/update/:id', upload.any(), async (req, res) => {
    try {
        const updatedRecord = await Record.findById(req.params.id);
        if (!updatedRecord) return res.status(404).send('Record not found!');

        Object.assign(updatedRecord, req.body);

        // Attach uploaded files (if any)
        req.files.forEach((file) => {
            updatedRecord[file.fieldname] = file.path;
        });

        await updatedRecord.save();
        res.send('Record updated successfully!');
    } catch (error) {
        res.status(500).send('Error updating record');
    }
});

// Delete a record Route
app.delete('/delete/:id', async (req, res) => {
    try {
        const deletedRecord = await Record.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).send('Record not found!');
        res.send('Record deleted successfully!');
    } catch (error) {
        res.status(500).send('Error deleting record');
    }
});

// Export records to Excel Route
app.get('/export', async (req, res) => {
    try {
        const records = await Record.find();

        // Convert records to a worksheet
        const worksheet = xlsx.utils.json_to_sheet(records);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Records');

        const filePath = path.join(__dirname, 'records.xlsx');
        xlsx.writeFile(workbook, filePath);

        res.download(filePath, 'records.xlsx', (err) => {
            if (err) console.error('Error exporting to Excel:', err);
            fs.unlinkSync(filePath); // Delete the file after sending
        });
    } catch (error) {
        res.status(500).send('Error exporting to Excel');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
