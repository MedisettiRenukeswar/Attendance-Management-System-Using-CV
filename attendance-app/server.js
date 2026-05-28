require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const users = require('./routes/users');
const Attendance = require('./models/Attendance');
const app = express();
const faceapi = require('face-api.js');
const { Canvas, Image } = require('canvas');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

faceapi.env.monkeyPatch({ Canvas, Image });

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://rjjarvis91:RjJravis91@cluster0.iueyhrj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/user', users);

app.post('/api/attendance/save', async (req, res) => {
  const { records } = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Invalid attendance records format.' });
  }

  try {
    // Save each attendance record
    const savedRecords = await Promise.all(records.map(record => {
      const attendance = new Attendance(record);
      return attendance.save();
    }));

    return res.status(201).json({ message: 'Attendance records saved successfully.', savedRecords });
  } catch (error) {
    console.error('Error saving attendance records:', error);
    return res.status(500).json({ message: 'An error occurred while saving attendance records.', error: error.message });
  }
});

// Route to fetch attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Directory for uploaded files
const uploadDir = path.join(__dirname, '../client/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to get the next image number
const getNextImageNumber = (userFolder) => {
  const files = fs.readdirSync(userFolder);
  const imageFiles = files.filter(file => file.startsWith('image') && path.extname(file) === '.png');
  const numbers = imageFiles.map(file => parseInt(file.replace('image', '').replace('.png', '')));
  return Math.max(0, ...numbers) + 1;
};

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userName = req.body.userName && req.body.userName.trim() ? req.body.userName.trim() : 'tony';
    const userFolder = path.join(uploadDir, userName);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const userName = req.body.userName && req.body.userName.trim() ? req.body.userName.trim() : 'tony';
    const userFolder = path.join(uploadDir, userName);
    const nextImageNumber = getNextImageNumber(userFolder);
    const name = `image${nextImageNumber}.png`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// File upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('Image uploaded successfully');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
