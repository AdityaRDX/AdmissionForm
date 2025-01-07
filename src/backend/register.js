const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // Import multer for file upload handling

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/admission_db', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const PORT = 5000;

// Set up CORS and body parsers
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Multer for file uploads (photo field)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename for each upload
    },
});

const upload = multer({ storage: storage });

// Define User schema for registration
const userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    middleName: String,
    lastName: String,
    mobileNumber: String,
    email: { type: String, unique: true },
    password: String,
    photo: String,  // Save the file path
});

const User = mongoose.model('User', userSchema);

// Handle user registration with file upload
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

        // Create new user, store photo path
        const newUser = new User({
            username,
            firstName,
            middleName,
            lastName,
            mobileNumber,
            email,
            password: hashedPassword,
            photo: req.file ? req.file.path : null,  // Save file path from Multer
        });

        await newUser.save();

        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
