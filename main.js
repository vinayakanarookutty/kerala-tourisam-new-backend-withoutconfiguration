var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
// MongoDB Connection to cloud database
mongoose.connect(
  "mongodb+srv://vinayaksukhalal:12344321@cluster0.mcgbpy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(()=>{
    console.log("DB Connected")
});

//Schema of the User
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  mobileNo: Number,
  password: String,
});

// Registering schema to mongoose
var UserModal = mongoose.model("user", userSchema);
