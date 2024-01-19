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
app.use(cors());
app.use(express.json());

//static files
app.use(express.static(path.join(__dirname, '../client/build')));

//route

app.use('/api/v1/portfolio', require('./routes/portfolioRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})