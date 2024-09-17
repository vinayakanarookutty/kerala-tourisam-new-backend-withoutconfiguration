var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
// MongoDB Connection to cloud database
// mongoose.connect(
//   "mongodb+srv://vinayaksukhalal:12344321@cluster0.mcgbpy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// ).then(()=>{
//     console.log("DB Connected")
// });
mongoose.connect(
    "mongodb+srv://vinayaksukhalal:goKeral%40123@cluster0.vqk0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  ).then(()=>{
      console.log("DB Connected")
  });
//Schema of the User
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: Number,
  password: String,
  terms:Boolean
});

var pinSchema = mongoose.Schema({
  id:Date,
  title: String,
  description: String,
  rating: Number,
  latitude: Number,
  longitude:Number
});

// Registering schema to mongoose
var UserModal = mongoose.model("user", userSchema);
var PinModal=mongoose.model("pins",pinSchema)
router.post("/signup", async (req, res) => {
  try {
    console.log(req.body)
    
    var user = new UserModal({
      name: req.body.name,
      email:  req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      terms:req.body.terms
    });

    // Save the user and wait for the operation to complete
    await user.save();

    // Redirect after the user is successfully saved
    res.status(200).json("User Created Succesfully");
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/login", async (req, res) => {
  console.log(req.body);
  var user = await UserModal.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
      if (user.password == req.body.password) {
        email = user.email;
        // res.redirect(`/home?id=${user._id}&msg=`);
        res.status(200).json({
          message:"Login Succesfull",
          user
        })
      } else {
        // res.render("login", { status: "Password is Wrong" });
        res.status(404).json("Password is Wrong")
      }
  } else {
   
    res.status(404).json("UserName is Wrong")
  }
});

router.post("/pins", async (req, res) => {
  console.log(req.body);
  var pins = new PinModal(req.body);

  // Save the user and wait for the operation to complete
  await pins.save();
  
});

router.get("/pins", async (req, res) => {

  var pins = await PinModal.find({});
  console.log(pins)
  res.json(pins)
 
});



module.exports = router