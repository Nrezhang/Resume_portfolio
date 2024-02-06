const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const exp = require('constants');
const path = require('path');
const e = require('express');


//dotenv config
dotenv.config();

//rest object
const app = express();

//middleware
app.use(cors(
    {
        origin: 'https://www.henryszhang.com',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://www.henryszhang.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
app.use(express.json());

//static files
app.use(express.static(path.join(__dirname, '../build')));

//route

app.use('/api/v1/portfolio', require('./routes/portfolioRoutes'));

app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})