const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

const registerUser = async (req, res) => {
	try {
		let { firstName, lastName, email, password } = req.body;

		// ✅ Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User Already Exists" });
		}

		// ✅ Hash the password securely
		const hashedPassword = bcrypt.hashSync(password, 8);
		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
		});

		// ✅ Save user to the database
		const user = await newUser.save();

		// ✅ Generate JWT token
		const token = generateToken(user._id);

		res.status(201).json({
			message: "Registration Successful",
			token: token,
		});
	} catch (error) {
		console.error("❌ Registration Error:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

const loginUser = async (req, res) => {
	try {
		let { email, password } = req.body;

		// ✅ Find user by email
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User Not Found" });
		}

		// ✅ Check if password is correct
		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid Password" });
		}

		// ✅ Generate JWT token
		const token = generateToken(user._id);

		// ✅ Remove password before sending the response
		user.password = undefined;

		res.status(200).json({
			message: "Login Successful",
			data: user,
			token: token,
		});
	} catch (error) {
		console.error("❌ Login Error:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

module.exports = { registerUser, loginUser };
