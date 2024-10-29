const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const calculateAge = require("../utils/getAge");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signin = async (req, res) => {
    try {
        const { profileFor, gender, firstName, lastName, dob, religion, motherTongue, country, email, mobile, password } = req.body;

        const requiredFields = [
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password
        ];

        if (requiredFields.some(field => !field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const age = await calculateAge(dob)
        const user = new User({
            profileFor, gender, firstName, lastName, dob, religion,
            motherTongue, country, email, mobile, password: hashedPassword,
            age: age
        });

        await user.save();
        // await sendMail1(email);
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
        res.status(StatusCodes.CREATED).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: error.message || 'Unknown error' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter email and password",
            });
        }
        const user = await User.findOne({ email: email });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email or password",
                status: StatusCodes.UNAUTHORIZED,
                success: false,
            });
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1hr" }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(StatusCodes.OK).json({
            data: {
                token,
                user: userResponse,
            },
            status: StatusCodes.OK,
            success: true,
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error: error.message || 'Unknown error'
        });
    }
}

const logout = async (req, res) => {
    try {
        return res.status(StatusCodes.OK).json({
            message: "Successfully logged out",
            success: true,
            status: StatusCodes.OK
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error: error.message || 'Unknown error',
        });
    }
}

const search = async (req, res) => {
    try {
        const { gender, ageFrom, ageTo, religion, motherTongue } = req.query;

        const user = await User.find({ gender: gender, religion: religion, motherTongue: motherTongue });

        return res.status(StatusCodes.OK).json({ user })

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Server error',
            error: error.message || 'Unknown error'
        });
    }
}

module.exports = { signin, login, logout, search }