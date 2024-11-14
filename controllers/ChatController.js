const { StatusCodes } = require("http-status-codes");
const Message = require('./../models/message');
const User = require("../models/user");
const Room = require("../models/room");

const getMessage = async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const sendMessage = async (req, res) => {
    const { roomId, userId, message } = req.body;

    try {
        const newMessage = new Message({
            roomId,
            userId,
            message,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

const createRoom = async (req, res) => {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length === 0) {
        return res.status(400).json({ error: 'Room name and at least one participant are required' });
    }

    try {
        const sortedParticipants = participants.sort((a, b) => a.localeCompare(b));
        const existingRoom = await Room.findOne({ participants: { $all: sortedParticipants } });

        if (existingRoom) {
            return res.status(400).json({ error: 'Room with this name already exists' });
        }

        const newRoom = new Room({
            name,
            participants,
        });

        await newRoom.save();

        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create room' });
    }
};

module.exports = { getMessage, sendMessage, getRooms, createRoom };