const express = require('express');
const multer = require('multer');
const path = require('path');
const Record = require('../models/Record');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Storage conffiguration with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

//valid token for these routes
router.use(protect);

//Admin and records officer can access these records
router.use(restrictTo('records_officer', 'admin', 'supervisor'));

//fetching all records with optional search
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { nameOfSchool: { $regex: search, $options: 'i' }},
                    { schoolCode: { $regex: search, $options: 'i' }},
                    { yearOfGraduation: { $regex: search, $options: 'i' }},
                ]
            };
        }

        const records = await Record.find(query).sort({ createdAt: -1 });
        res.json(records);
    }   catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


//Uploading new records
router.post('/', restrictTo('records_officer', 'admin'), upload.single('file'), async(req, res) => {
    try {
        const { nameOfSchool, schoolCode, yearOfGraduation } = req.body;

        const record = new Record({
            nameOfSchool,
            schoolCode,
            yearOfGraduation,
            file: req.file ? req.file.filename : null,
            uploadedBy: req.user.id
        });

        await record.save();
        res.status(201).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//Get a single record
router.get('/:id', async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;