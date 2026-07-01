const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Import and Use Routes
const taskRouter = require('./routes/taskRoutes');
app.use('/api/tasks', taskRouter); // All task routes will now start with /api/tasks


// Test Route
app.get('/', (req, res) => {
  res.send('Task Tracker API is running smoothly!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is blasting off on port ${PORT}`);
});