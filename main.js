var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Schema = mongoose.Schema;
// MongoDB Connection to cloud database
mongoose.connect(
  "mongodb+srv://vinayaksukhalal:12344321@cluster0.mcgbpy6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(()=>{
    console.log("DB Connected")
});
// mongoose.connect(
//     "mongodb://localhost:27017/gokeral"
//   ).then(()=>{
//       console.log("DB Connected")
//   });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const upload = multer({ storage });

// Define Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  licensePlate: String,
  type: String,
  Driving_Licence: String, // File path
  Vehicle_Insurance_Proof: String, // File path
  Proof_Of_Address: String, // File path
  Police_Clearance_Certificate: String, // File path
},{strict:false});


//Schema of the User
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: Number,
  password: String,
  terms:Boolean
},{strict:false});


var driverSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  password: String,
  agreement:Boolean,
  drivinglicenseNo:String
},{strict:false});

var adminSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  password: String,
  agreement:Boolean,
},{strict:false});

var pinSchema = mongoose.Schema({
  id:Date,
  title: String,
  description: String,
  rating: Number,
  latitude: Number,
  longitude:Number
});
const bookingSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  distance: Number,
  duration: Number,
  driverId: String,
  driverName: String,
  driverRating: Number,
  date: { type: Date, default: Date.now },
},{strict:false});



const QuotationSchema = new mongoose.Schema({
  customerName: { type: String },
  vehicleType: { type: String},
  bookingDatefrom: { type: Date },
  bookingDateto: { type: Date },
  price: { type: Number },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const quatationModel = mongoose.model('Quotation', QuotationSchema);


// Booking Model
const Booking = mongoose.model('Booking', bookingSchema);

// Registering schema to mongoose
var UserModal = mongoose.model("user", userSchema);
var PinModal=mongoose.model("pins",pinSchema)
var driverModal=mongoose.model("drivers",driverSchema)
var adminModal=mongoose.model("admin",adminSchema)
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
// Configure multer for file uploads


// Route to add a new vehicle
router.post('/addvehicles', upload.fields([
  { name: 'Driving_Licence' },
  { name: 'Vehicle_Insurance_Proof' },
  { name: 'Proof_Of_Address' },
  { name: 'Police_Clearance_Certificate' },
  { name: 'vehicleImages' }
]), async (req, res) => {
  try {
    const { body, files } = req;

    // Process documents
    const documents = {
      Driving_Licence: files.Driving_Licence?.[0] || null,
      Vehicle_Insurance_Proof: files.Vehicle_Insurance_Proof?.[0] || null,
      Proof_Of_Address: files.Proof_Of_Address?.[0] || null,
      Police_Clearance_Certificate: files.Police_Clearance_Certificate?.[0] || null
    };

    // Create new vehicle document in database
    const vehicle = new Vehicle({
      ...body,
      documents: documents,
      vehicleImages: files.vehicleImages || []
    });

    await vehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully!' });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle.' });
  }
});

// Route to update an existing vehicle

router.put('/updatevehicle/:id', upload.fields([
  { name: 'Driving_Licence' },
  { name: 'Vehicle_Insurance_Proof' },
  { name: 'Proof_Of_Address' },
  { name: 'Police_Clearance_Certificate' },
  { name: 'vehicleImages' }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    // Find the existing vehicle document
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Prepare the update payload
    const updatePayload = {
      ...body,
      documents: {
        Driving_Licence: files.Driving_Licence?.[0] || existingVehicle.documents.Driving_Licence,
        Vehicle_Insurance_Proof: files.Vehicle_Insurance_Proof?.[0] || existingVehicle.documents.Vehicle_Insurance_Proof,
        Proof_Of_Address: files.Proof_Of_Address?.[0] || existingVehicle.documents.Proof_Of_Address,
        Police_Clearance_Certificate: files.Police_Clearance_Certificate?.[0] || existingVehicle.documents.Police_Clearance_Certificate
      },
      vehicleImages: files.vehicleImages || existingVehicle.vehicleImages || []
    };

    // Delete existing files if they are being replaced
    const deleteFile = (file) => {
      if (file) {
        const filePath = path.join(__dirname, '..', file.path); // Adjust the path as necessary
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${filePath}`, err);
          }
        });
      }
    };

    // Delete old document files
    deleteFile(existingVehicle.documents.Driving_Licence);
    deleteFile(existingVehicle.documents.Vehicle_Insurance_Proof);
    deleteFile(existingVehicle.documents.Proof_Of_Address);
    deleteFile(existingVehicle.documents.Police_Clearance_Certificate);

    // Update the vehicle document
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updatePayload, { new: true });

    res.status(200).json({ message: 'Vehicle updated successfully!', vehicle: updatedVehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle.' });
  }
});




router.delete('/deletevehicle/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the vehicle details by ID
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // List of files to delete
    const filesToDelete = [
      vehicle.documents.Driving_Licence.path,
      vehicle.documents.Vehicle_Insurance_Proof.path,
      vehicle.documents.Proof_Of_Address.path,
      vehicle.documents.Police_Clearance_Certificate.path,
      ...vehicle.vehicleImages.map(img => img.path) // Assuming vehicleImages contains file paths
    ];

    // Attempt to delete each file
    filesToDelete.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`Successfully deleted file ${filePath}`);
          }
        });
      } else {
        console.warn(`File not found, skipping deletion: ${filePath}`);
      }
    });

    // Remove vehicle document from the database
    await Vehicle.findByIdAndDelete(id);

    res.status(200).json({ message: 'Vehicle and associated files deleted successfully.' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle.' });
  }
});


router.post("/signup", async (req, res) => {
  try {
    console.log(req.body)
    
    var user = new UserModal({
      name: req.body.name,
      email:  req.body.email,
      phoneNumber: req.body.phone,
      password: req.body.password,
      terms:req.body.agreement
    });

    // Save the user and wait for the operation to complete
    await user.save();

    // Redirect after the user is successfully saved
    res.status(200).json({
      message:"User Created Succesfully",
      user
    })
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/quatation', async (req, res) => {
  try {
    const { customerName,  bookingDatefrom, bookingDateto, price, remarks } = req.body;

    const newQuotation = new quatationModel({
      customerName,
      bookingDatefrom,
      bookingDateto,
  
      price,
      remarks,
    });

    await newQuotation.save();
    res.status(201).json({ message: 'Quotation saved successfully' });
  } catch (error) {
    console.error('Error saving quotation:', error);
    res.status(500).json({ message: 'Error saving quotation' });
  }
});

router.post("/driversignup", async (req, res) => {
  try {
    console.log(req.body)
    var password = await bcrypt.hash(req.body.password, 10);
    var user = new driverModal({
      name: req.body.name,
      email:  req.body.email,
      phone: req.body.phone,
      password: password,
      drivinglicenseNo:req.body.drivinglicenseNo,
      agreement:req.body.agreement
    });

    // Save the user and wait for the operation to complete
    await user.save();

    // Redirect after the user is successfully saved
    res.status(200).json({
      message:"Driver Created Succesfully",
      user
    })
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/adminsignup", async (req, res) => {
  try {
    console.log(req.body)
    var password = await bcrypt.hash(req.body.password, 10);
    var user = new adminModal({
      name: req.body.name,
      email:  req.body.email,
      phone: req.body.phone,
      password: password,
      agreement:req.body.agreement
    });

    // Save the user and wait for the operation to complete
    await user.save();

    // Redirect after the user is successfully saved
    res.status(200).json("Admin Created Succesfully");
  } catch (error) {
    // Handle any errors that might occur during the process
    console.error("Error creating user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/addvehicles", async (req, res) => {
  try {
    console.log(req.body)
    // var password = await bcrypt.hash(req.body.password, 10);
    // var user = new driverModal({
    //   name: req.body.name,
    //   email:  req.body.email,
    //   phone: req.body.phone,
    //   password: password,
    //   drivinglicenseNo:req.body.drivinglicenseNo,
    //   agreement:req.body.agreement
    // });

    // // Save the user and wait for the operation to complete
    // await user.save();

    // // Redirect after the user is successfully saved
    // res.status(200).json("Driver Created Succesfully");
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


router.post("/driverlogin", async (req, res) => {
  console.log(req.body);
  var user = await driverModal.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
    bcrypt.compare(req.body.password, user.password).then((response) => {
      if (response) {
       email=user.email
        res.status(200).json({
          message:"User Found",
          user
        })
      } else {
        res.status(404).json("Password is Wrong")
      }
    });
  } else {
    res.status(404).json("UserName is Wrong")
  }
});


router.post("/adminlogin", async (req, res) => {
  console.log(req.body);
  var user = await adminModal.findOne({ email: req.body.email });
  console.log(user)
  if (user) {
    bcrypt.compare(req.body.password, user.password).then((response) => {
      if (response) {
       email=user.email
       res.status(200).json("User Found");
      } else {
        res.status(404).json("Password is Wrong")
      }
    });
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

router.get("/userData", async (req, res) => {

  var userData = await PinModal.findOne({});
  console.log(pins)
  res.json(pins)
 
});

router.get("/userList", async (req, res) => {

  var userData = await UserModal.find({});
  res.json(userData)
 
});

router.get("/quatations", async (req, res) => {

  var quatation = await quatationModel.find({});
  res.json(quatation)
 
});


router.get("/driverList", async (req, res) => {

  var driverData = await driverModal.find({});
  res.json(driverData)
 
});


router.get("/driverDetails", async (req, res) => {
  var {id}=req.query
 
  var email=req.query.id
  var userData = await driverModal.findOne({email:email});
 
  res.json(userData)
 
});

router.get("/userDetails", async (req, res) => {
  var {id}=req.query
 
  var email=req.query.id
  var userData = await UserModal.findOne({email:email});
 
  res.json(userData)
 
});


router.get("/userDetails", async (req, res) => {
  var {id}=req.query
 
  var email=req.query.id
  var userData = await UserModal.findOne({email:email});
 
  res.json(userData)
 
});

router.get("/adminDetails", async (req, res) => {
  var {id}=req.query
  console.log(id)
  var email=req.query.id
  var userData = await adminModal.findOne({email:email});
  console.log(userData)
  res.json(userData)
 
});

router.get("/userProfile", async (req, res) => {
  const userIdFromQuery = req.query.user;
  var user = await UserModal.findOne({ name:userIdFromQuery});
  console.log(user)
  res.json(user)
 
});

// to get all vehicles added
router.get("/getvehicles", async (req, res) => {
  var email=req.query.id
  var vehiclesAdded = await Vehicle.find({email:email});

  res.status(200).json(vehiclesAdded)
 
}); 

router.get("/getallvehicles", async (req, res) => {
 
  var vehiclesAdded = await Vehicle.find({});

  res.status(200).json(vehiclesAdded)
 
}); 

router.get('/uploads/:filePath', (req, res) => {
  console.log(req.params.filePath);
  const filePath = path.join(__dirname, 'uploads', req.params.filePath);
  console.log(filePath); // You might want to log the filePath instead of using json()
  
  // Check if the file exists before sending it
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File not found:", err);
      res.status(err.status).end();
    } else {
      console.log("File sent:", filePath);
    };
  })
});

router.post('/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error saving booking', error });
  }
});

// Get all bookings endpoint
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
});

router.post("/updateDriver", async (req, res) => {
  try {
    const filter = { email: req.body.mail };
    let data;

    if (req.body.imageUrl) {
      data = { imageUrl: req.body.imageUrl };
    } else {
      data = { personalInformation: { ...req.body } };
    }

    const result = await driverModal.findOneAndUpdate(filter, data, {
      new: true,
      upsert: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Driver not found or no update made." });
    }

    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/updateUser", async (req, res) => {
  try {
    const filter = { email: req.body.mail };
    let data;

    if (req.body.imageUrl) {
      data = { imageUrl: req.body.imageUrl };
    } else {
      data = { personalInformation: { ...req.body } };
    }

    const result = await UserModal.findOneAndUpdate(filter, data, {
      new: true,
      upsert: true,
    });

    if (!result) {
      return res.status(404).json({ message: "User not found or no update made." });
    }

    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router