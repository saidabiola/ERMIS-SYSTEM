const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {

    try {
        //get token from request headers
        const authHeader = req.headers.authorization;

        //check header exists and starts with 'Bearer'
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        //extract the token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        //verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user info to the request object
        req.user = decoded;

        //move on to the actual route handler
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };