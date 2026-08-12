require("dotenv").config();

const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require('./routes/auth');
const Record = require("./models/Record");
const adminRoutes = require('./routes/admin');
const recordRoutes = require('./routes/records');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.log(err));



//Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/records", recordRoutes)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to Ermis Backend, Testing API...");
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
})
