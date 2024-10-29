const connect = require('./db/connect');
const bodyParser = require('body-parser');
const routes = require('./routes/routes')
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors');

const app = express();
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
    origin: ['http://localhost:4200', 'http://localhost:5000']
};

app.use(cors(corsOptions));

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

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
