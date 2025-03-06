const { StatusCodes } = require("http-status-codes");
const Visit = require('./../models/visitors');
const User = require("../models/user");
const likes = require("../models/likes");

// API to log a visit to a profile
const visitProfile = async (req, res) => {
    const { visitorId, visitedId } = req.body;

    if (!visitorId || !visitedId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Visitor ID and Visited ID are required' });
    }

    try {
        // Check if a visit already exists for the same visitor and visited user
        const existingVisit = await Visit.findOne({ visitorId, visitedId });

        if (existingVisit) {
            return res.status(StatusCodes.OK).json({
                message: 'Visit already created for this user.',
                visit: existingVisit 
            });
        }

        const visitor = await User.findById(visitedId); //=================================================

        if (!visitor) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Visitor not found' });
        }

        const visit = new Visit({
            visitorId,
            visitedId,
            visitor: {
                firstName: visitor.firstName,
                lastName: visitor.lastName,
                dob: visitor.dob,
                country: visitor.country,
                email: visitor.email,
                age: visitor.age,
                likes: visitor.likes,
            }
        });

        await visit.save();
        res.status(StatusCodes.CREATED).json({ message: 'Visit created successfully', visit });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating visit', error });
    }
};

// API to get recent visitors of a user (visits made to their profile)
const getVisitors = async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'User ID is required',
            success: false
        });
    }
    try {
        const visits = await Visit.find({ visitedId: userId })
            .sort({ visitedAt: -1 })
            .limit(10)
            .populate('visitorId', 'firstName lastName email age country'); // Populate visitor data for clarity
        res.status(StatusCodes.OK).json({
            data: visits,
            status: StatusCodes.OK,
            success: true,
            message: 'Visitors fetched successfully!!'
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching visitors', error });
    }
};

// API to get recent profiles visited by a user
const getVisited = async (req, res) => {
    const { userId } = req.params;

    try {
        const visits = await Visit.find({ visitorId: userId })
            .sort({ visitedAt: -1 })
            .limit(10)
            .populate('visitedId', 'firstName lastName email age country'); // Populate visited profile data

        res.status(StatusCodes.OK).json({
            data: visits,
            status: StatusCodes.OK,
            success: true,
            message: 'Visited profiles fetched successfully!!'
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching visited profiles', error });
    }
};

module.exports = { visitProfile, getVisitors, getVisited };
