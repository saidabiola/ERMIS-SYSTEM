const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true,
    },
    studentIndexNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    yearOfGraduation: {
        type: Number,
        required: true
    },
    file: {
        type: String,
        default: "",
    },
    
    role: {
        type: String,
        enum: ["RECORDS OFFICER", "SUPERVISOR", "ICT OFFICER", "ADMIN"],
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Record", recordSchema);