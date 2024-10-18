const connect = require('./db/connect');
const bodyParser = require('body-parser');
const routes = require('./routes/routes')
const dotenv = require('dotenv')
const express = require('express')

const app = express();
dotenv.config();
const port = process.env.PORT || 4000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
        console.log('ERROR:', error);
    }
};
start();
