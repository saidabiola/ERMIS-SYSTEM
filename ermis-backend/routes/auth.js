const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User')



const router = express.Router()

router.post('/login', async (req, res) => {
    
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, isActive: true });
            if (!user) return res.status(401).json({ message: 'Invalid Credentials' });

        const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

        const token = jwt.sign(
            { id:user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '8h'}
    );

    // send token and role back to frontend
    res.json({ token, role: user.role, name: user.name });

} catch (err) {
    console.error('Login error:', err);
}
});

module.exports = router;