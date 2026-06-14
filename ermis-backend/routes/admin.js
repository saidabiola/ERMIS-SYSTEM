const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { trusted } = require('mongoose');

const router = express.Router();


//all routes below require a valid token and admin role
router.use(protect);
router.use(restrictTo('admin'));

//GET /api/admin/users (fetch all users)
router.get('/users', async (req, res) => {
    try {
        //exclude password field from results
        const users = await User.find().select('-password');
        res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

//POST /api/admin/users (create a user)
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        //check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already exist' })
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name, 
            email,
            password: hashedPassword,
            role,
            isActive: true
        });

        await user.save();

        //return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json(userWithoutPassword);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message:'Server error' })
    }

});

//PUT /api/admin/users/:id (update user role and status)
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, isActive },
            { new:true }

        ).select('-password');

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//DELETE /api/admin/users/:id (deactivate a user - never hard delete)
router.delete('/users/:id', async (req, res) => {
    try {
        //prevent admin from deactivating themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(400).json({ message: 'User not found' });

        }
        res.json({ message: 'User deactivated successfully', user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;