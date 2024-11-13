const { StatusCodes } = require("http-status-codes");
const Message = require('./../models/message');
const User = require("../models/user");

// router.get('/messages/:roomId', async (req, res) => {
const getMessage = async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// router.post('/messages', async (req, res) => {
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

module.exports = { getMessage, sendMessage };