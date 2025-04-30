const { StatusCodes } = require("http-status-codes");
const Visit = require('./../models/visitors');
const User = require("../models/user");

/**
 * Records a visit when a user views another user's profile
 * @route POST /api/visits/post-visit
 * @access Private
 */
const visitProfile = async (req, res) => {
    try {
        const { visitorId, visitedId } = req.body;
        
        // Validate required fields
        if (!visitorId || !visitedId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                success: false,
                message: 'Visitor ID and Visited ID are required' 
            });
        }

        // Prevent users from recording visits to their own profile
        if (visitorId === visitedId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                success: false,
                message: 'Cannot visit your own profile' 
            });
        }

        // Check if both users exist
        const [visitor, visited] = await Promise.all([
            User.findById(visitorId),
            User.findById(visitedId)
        ]);

        if (!visitor) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false,
                message: 'Visitor not found' 
            });
        }

        if (!visited) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false,
                message: 'Visited user not found' 
            });
        }

        // Check if a visit already exists
        const existingVisit = await Visit.findOne({ visitorId, visitedId });

        if (existingVisit) {
            // Update the timestamp to show it was visited again
            existingVisit.visitedAt = new Date();
            existingVisit.updatedAt = new Date();
            await existingVisit.save();
            
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Visit updated successfully',
                visit: existingVisit 
            });
        }

        // Create new visit record
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
                likes: visitor.likes || 0,
                isLiked: visitor.isLiked,
                isFavorited: visitor.isFavorited || false,
            },
            visited: {
                firstName: visited.firstName,
                lastName: visited.lastName,
                dob: visited.dob,
                country: visited.country,
                email: visited.email,
                age: visited.age,
                likes: visited.likes || 0,
                isLiked: visited.isLiked,
                isFavorited: visited.isFavorited || false,
            }
        });

        await visit.save();
        
        res.status(StatusCodes.CREATED).json({ 
            success: true,
            message: 'Visit created successfully', 
            visit 
        });
    } catch (error) {
        console.error('Error creating visit:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: 'Error creating visit', 
            error: error.message 
        });
    }
};

/**
 * Gets the list of users who visited a specific user's profile
 * @route GET /api/visits/visitors/:userId
 * @access Private
 */
const getVisitors = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Validate required fields
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get total count for pagination
        const totalVisits = await Visit.countDocuments({ visitedId: userId });
        
        // Find visits where the current user is the visited person
        const visits = await Visit.find({ visitedId: userId })
            .sort({ visitedAt: -1 })
            .skip(skip)
            .limit(limit);
            
        // Return with pagination metadata
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Visitors fetched successfully',
            data: visits,
            pagination: {
                count: totalVisits,
                pages: Math.ceil(totalVisits / limit),
                currentPage: page,
                itemsPerPage: limit,
            }
        });
    } catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: 'Error fetching visitors', 
            error: error.message
        });
    }
};

/**
 * Gets the list of profiles that a specific user has visited
 * @route GET /api/visits/visited/:userId
 * @access Private
 */
const getVisited = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Validate required fields
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get total count for pagination
        const totalVisits = await Visit.countDocuments({ visitorId: userId });
        
        // Find visits where the current user is the visitor
        const visits = await Visit.find({ visitorId: userId })
            .sort({ visitedAt: -1 })
            .skip(skip)
            .limit(limit);
            
        // Return with pagination metadata
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Visited profiles fetched successfully',
            data: visits,
            pagination: {
                count: totalVisits,
                pages: Math.ceil(totalVisits / limit),
                currentPage: page,
                itemsPerPage: limit,
            }
        });
    } catch (error) {
        console.error('Error fetching visited profiles:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: 'Error fetching visited profiles', 
            error: error.message
        });
    }
};


module.exports = { visitProfile, getVisitors, getVisited };
