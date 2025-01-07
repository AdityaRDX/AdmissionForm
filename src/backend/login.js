const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

mongoose.connect('mongodb://localhost:27017/admission_db', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define User model (same as in registration)
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    firstName: String,
    middleName: String,
    lastName: String,
    mobileNumber: String,
    email: { type: String, unique: true },
    password: String,
    photo: String
}));

// Handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
