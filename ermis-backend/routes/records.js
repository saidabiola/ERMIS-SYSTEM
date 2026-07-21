const express = require('express');
const multer = require('multer');
const path = require('path');
const Record = require('../models/Record');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

