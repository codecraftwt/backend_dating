const { StatusCodes } = require("http-status-codes");
const Message = require('./../models/messageNew');
const User = require("../models/user");
const Room = require("../models/roomNew");
const { mongoose } = require("mongoose");
const { ObjectId } = mongoose.Types;

const createRoom = async (req, res) => {
    const { createdBy, createdWith } = req.body;

    if (!createdBy || !createdWith) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Both participants are required' });
    }

    try {
        const createdByUser = await User.findById(createdBy).select('firstName lastName profilePhoto _id');
        const createdWithUser = await User.findById(createdWith).select('firstName lastName profilePhoto _id');
        const existingRoom = await Room.findOne({
            $or: [
                // { createdBy: createdBy, createdWith: createdWith },
                // { createdBy: createdWith, createdWith: createdBy },
                { 'createdBy._id': new ObjectId(createdBy), 'createdWith._id': new ObjectId(createdWith) },
                { 'createdBy._id': new ObjectId(createdWith), 'createdWith._id': new ObjectId(createdBy) }
            ],
        }, '-chat')
            .populate({
                path: 'chat',
                options: { sort: { 'timestamp': -1 }, limit: 1 }
            });;

        const roomsWithLatestMessage = [existingRoom].map(room => {
            if (room.chat && room.chat.length > 0) {
                room.chat.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                const latestMessage = room.chat[0];

                return {
                    ...room.toObject(),
                    chat: [latestMessage]
                };
            }
            return {
                ...room.toObject(),
                chat: []
            };
        });

        if (existingRoom) {
            return res.status(StatusCodes.OK).json({ status: StatusCodes.BAD_REQUEST, success: false, message: 'Room with these participants already exists', data: roomsWithLatestMessage });
        }

        const newRoom = new Room({
            createdBy: createdByUser,
            createdWith: createdWithUser,
        });
        req.io.emit('createroom', newRoom)
        await newRoom.save();

        res.status(StatusCodes.CREATED).json({ data: newRoom, status: StatusCodes.CREATED, success: true, message: 'Room created successfully..!!' });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create room' });
    }
};

const sendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    const { roomId } = req.params;

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            console.error(`Room with ID ${roomId} not found`);
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Room not found' });
        }

        if (![room.createdBy._id.toString(), room.createdWith._id.toString()].includes(senderId)) {
            console.error(`Sender ${senderId} is not part of this room`);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Sender is not part of this room' });
        }

        if (![room.createdBy._id.toString(), room.createdWith._id.toString()].includes(receiverId)) {
            console.error(`Receiver ${receiverId} is not part of this room`);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Receiver is not part of this room' });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        room.chat.push(newMessage);

        await room.save();

        req.io.emit('message', { roomId, newMessage });

        res.status(StatusCodes.CREATED).json({ roomId, newMessage });
    } catch (err) {
        console.error('Error while sending message:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to send message' });
    }
};

const getAllRooms = async (req, res) => {
    const { userId } = req.params;
    console.log(userId, 'userId')
    try {
        // const rooms = await Room.find({}, '-chat');

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const rooms = await Room.find({
            $or: [
                { 'createdBy._id': new ObjectId(userId) },
                { 'createdWith._id': new ObjectId(userId) }
            ]
        }, '-chat')
            .populate({
                path: 'chat',
                options: { sort: { 'timestamp': -1 }, limit: 1 }
            });

        const roomsWithLatestMessage = rooms.map(room => {
            if (room.chat && room.chat.length > 0) {
                room.chat.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                const latestMessage = room.chat[0];

                return {
                    ...room.toObject(),
                    chat: [latestMessage]
                };
            }
            return {
                ...room.toObject(),
                chat: []
            };
        });

        if (roomsWithLatestMessage.length === 0) {
            return res.status(StatusCodes.OK).json({ status: StatusCodes.OK, data: roomsWithLatestMessage, message: 'No rooms found' });
        }
        req.io.emit('rooms')
        res.status(StatusCodes.OK).json({ status: StatusCodes.OK, data: roomsWithLatestMessage, message: 'Rooms fetched successfully' });
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch rooms' });
    }
};

const getRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
        }
        req.io.emit('room', roomId)
        res.status(StatusCodes.OK).json({ data: room, status: StatusCodes.OK, success: true, message: 'Room fetched successfully' });
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch rooms' });
    }
};

const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findByIdAndDelete(roomId);

        if (!room) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
        }
        req.io.emit('room', roomId)
        res.status(StatusCodes.OK).json({ data: room, status: StatusCodes.OK, success: true, message: 'Room deleted successfully' });
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch rooms' });
    }
};

const deleteMessage = async (req, res) => {
    const { roomId, messageId } = req.params;
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Room not found' });
        }

        const messageIndex = room.chat.findIndex(msg => msg._id.toString() === messageId);
        if (messageIndex === -1) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Message not found' });
        }

        room.chat.splice(messageIndex, 1);

        await room.save();

        req.io.emit('messageDeleted', { roomId, messageId });

        res.status(StatusCodes.OK).json({
            message: 'Message deleted successfully',
            status: StatusCodes.OK,
            success: true
        });
    } catch (err) {
        console.error('Error deleting message:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete message' });
    }
};

module.exports = { createRoom, sendMessage, getAllRooms, getRoom, deleteMessage, deleteRoom };