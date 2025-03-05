const { StatusCodes } = require("http-status-codes");
const Visit = require('./../models/visitors');
const User = require("../models/user");

// const visitProfile = async (req, res) => {
//     const { visitorId, visitedId } = req.body;

//     if (!visitorId || !visitedId) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Visitor ID and Visited ID are required' });
//     }

//     try {
//         const visitor = await User.findById(visitorId);
//         const visit = new Visit({
//             visitorId,
//             visitedId,
//             visitor: {
//                 firstName: visitor.firstName,
//                 lastName: visitor.lastName,
//                 dob: visitor.dob,
//                 country: visitor.country,
//                 email: visitor.email,
//                 age: visitor.age,
//             }
//         });

//         await visit.save();
//         res.status(StatusCodes.CREATED).json({ message: 'Visit logged successfully', visit });
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error logging visit', error });
//     }
// };

// const getVisitors = async (req, res) => {
//     const { userId } = req.params;

//     try {

//         const visits = await Visit.find({ visitorId: userId })
//             .sort({ visitedAt: -1 })
//             .limit(10);

//         res.status(StatusCodes.OK).json({ data: visits, status: StatusCodes.OK, success: true, message: 'Users fetched successfully!!' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching visitors', error });
//     }
// };

// const getVisited = async (req, res) => {
//     const { userId } = req.params;

//     try {

//         // const visits = await Visit.find({ visitedId: userId })
//         //     .sort({ visitedAt: -1 })
//         //     .limit(10);
//         const visits = await Visit.find({ visitedId: userId })
//             // .populate('visitorId', 'firstName lastName email')
//             .sort({ visitedAt: -1 })
//             .limit(10);

//         res.status(StatusCodes.OK).json({ data: visits, status: StatusCodes.OK, success: true, message: 'Users fetched successfully!!' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching visitors', error });
//     }
// };


// module.exports = { visitProfile, getVisitors, getVisited };

// API to log a visit to a profile
const visitProfile = async (req, res) => {
    const { visitorId, visitedId } = req.body;

    if (!visitorId || !visitedId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Visitor ID and Visited ID are required' });
    }

    try {
        const visitor = await User.findById(visitorId);

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
            }
        });

        await visit.save();
        res.status(StatusCodes.CREATED).json({ message: 'Visit logged successfully', visit });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error logging visit', error });
    }
};

// API to get recent visitors of a user (visits made to their profile)
const getVisitors = async (req, res) => {
    const { userId } = req.params;

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
