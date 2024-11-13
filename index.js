const connect = require('./db/connect');
const bodyParser = require('body-parser');
const routes = require('./routes/routes')
const dotenv = require('dotenv')
const express = require('express')
const http = require('http');
const cors = require('cors');

const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
dotenv.config();
const port = process.env.PORT || 4000;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

const corsOptions = {
    // origin: true,
    // methods: 'POST,GET,PUT,OPTIONS,DELETE',
    // allowedHeaders: 'Content-Type, Authorization',
    // origin: ['http://localhost:4200', 'http://localhost:5000', '*']
    origin: '*'
};

app.use(cors(corsOptions));

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join room event
    socket.on('join room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle sending messages via socket
    socket.on('sendMessage', async (messageData) => {
        const { roomId, userId, message } = messageData;

        // Save message to the database
        const newMessage = new Message({
            roomId,
            userId,
            message,
        });

        try {
            await newMessage.save();
            // Broadcast message to all users in the room
            io.to(roomId).emit('receiveMessage', newMessage);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    // WebRTC signaling (Offer, Answer, ICE Candidates)
    socket.on('offer', (offer, roomId) => {
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (answer, roomId) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice candidate', (candidate, roomId) => {
        socket.to(roomId).emit('ice candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


app.get('/', (req, res) => {
    res.send("Hello, there!! this is dating app's backend");
});

app.use('/api', routes);

const start = async () => {
    try {
        await connect(process.env.MONGO_URL);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.error('ERROR:', error);
    }
};
start();
