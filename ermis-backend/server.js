require("dotenv").config();

const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.log(err));


const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

//Routes
app.get("/", (req, res) => {
    res.send("Welcome to Ermis Backend, Testing API...");
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
})

//Importing routes

const Record = require("./models/Record");

app.post("/records", upload.single("file"),async (req, res) => {
    try {


        const newRecord = new Record({
            nameOfSchool: req.body.nameOfSchool,
            schoolCode: req.body.schoolCode,
            yearOfGraduation: req.body.yearOfGraduation,
            file: req.file ? req.file.filename : null
        });
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    
});

// Get all records
app.get("/records", async (req, res) => {
    try {
        const records = await Record.find();
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});

//Deleting an Item
app.delete("/records/:id", async (req, res) => {
    try {
        await Record.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Record Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Updating/Editing Records
app.put("/records/:id", async (req, res) => {
    try {
        const updated = await Record.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }

        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});


