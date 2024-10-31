var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var cors = require("cors");

// Enable CORS for all routes
app.use(cors());

// Parse incoming request bodies
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyparser.urlencoded({ limit: '10mb', extended: true }));

var main = require("./main");



// Start server
app.listen("3000", () => {
  console.log("Server Started");
});

// Use the main route
app.use("/", main);
