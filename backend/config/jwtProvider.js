const jwt = require("jsonwebtoken");

// Validate JWT_SECRET immediately when module loads
if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET not configured in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
    try {
        const token = jwt.sign(
            { userId }, 
            JWT_SECRET, 
            { expiresIn: "48h" }
        );
        return token;
    } catch (error) {
        console.error('JWT Token Generation Error:', error);
        throw new Error('Failed to generate authentication token');
    }
};

const getUserIdFromToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        return decodedToken.userId;
    } catch (error) {
        console.error('JWT Token Verification Error:', error);
        
        // Specific error messages for different cases
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw new Error('Authentication failed');
    }
};

module.exports = {
    generateToken,
    getUserIdFromToken
};