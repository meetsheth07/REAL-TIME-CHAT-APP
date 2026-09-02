const { getUserIdFromToken } = require("../config/jwtProvider");
const User = require("../models/user");

const authorization = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const userId = getUserIdFromToken(token);
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { authorization };