const connect = require('./db/connect');
const bodyParser = require('body-parser');
const routes = require('./routes/routes')
const dotenv = require('dotenv')
const express = require('express')
const http = require('http');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
dotenv.config();
const io = socketIO(server, {
    cors: {
        origin: '*',  // Allow all origins
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type'],
    },
});
const port = process.env.PORT || 4000;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

const corsOptions = {
    origin: true,
    methods: 'POST,GET,PUT,OPTIONS,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    origin: ['http://localhost:4200', 'https://dating-web-app-chi.vercel.app/', '*']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json())

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

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
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.error('ERROR:', error);
    }
};
start();
