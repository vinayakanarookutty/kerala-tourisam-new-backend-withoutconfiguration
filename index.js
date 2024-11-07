const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");

// More permissive CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://d1w5k4nn5lbs5k.cloudfront.net'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // Preflight results cache for 24 hours
}));

// Increase payload limits
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

// For handling preflight requests
app.options('*', cors());

// Your routes
var main = require("./main");
app.use("/", main);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});