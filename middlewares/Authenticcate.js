const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded._id };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateMiddleware;
