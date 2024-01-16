const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const exp = require('constants');


//dotenv config
dotenv.config();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json());

//route
app.get('/', (req, res) => { res.send('<h1>Welcome to my Portfolio API</h1>')});
app.use('/api/v1/portfolio', require('./routes/portfolioRoutes'));

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})