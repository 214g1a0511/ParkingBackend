const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomerRecordModel = require("../Models/CustomerRecord.model");
const UserModel = require("../Models/User.model");
const customer_router = express.Router();
const tokenmiddleware = require("../Middlewares/Authentication.middleware");
const { generateUniqueId } = require("../Functions/function");
customer_router.post("/register", async (req, res) => {
  const { email_id, phone_number, password, full_name } = req.body;

  try {
    let user = await CustomerRecordModel.findOne({ email_id });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new CustomerRecordModel({
      full_name,
      email_id,
      password,
      phone_number,
      parking_vendor: "Shiva",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: "Successfully registered" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

customer_router.post("/login", async (req, res) => {
  const { email_id, password } = req.body;

  try {
    let user = await CustomerRecordModel.findOne({ email_id: email_id });
    if (!user) {
      return res.status(400).json("Invalid credentials");
    }
    console.log("req pass", password);
    console.log("req DB", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    const payload = {
      user: {
        id: user.id,
        email_id: user.email_id,
        parking_vendor: user.parking_vendor,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) {
          return res.status(500).json("Error signing token");
        }
        res.json({ msg: "Successfully Login", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// new route to get slot for bike and car

customer_router.get("/userDetails", tokenmiddleware, async (req, res) => {
  try {
    // console.log("user id ", req.user);
    const user_details = await CustomerRecordModel.findOne(
      {
        _id: req.user.id,
      },
      { password: 0 }
    );

    console.log(user_details);

    res.send(user_details);
  } catch (error) {
    res.send(error);
  }
});

customer_router.get(
  "/slots/:vehicleType",
  tokenmiddleware,
  async (req, res) => {
    const { vehicleType } = req.params; // Extract vehicleType from params
    console.log("vehicleType", vehicleType);
    // Validate the vehicleType
    if (vehicleType !== "bike" && vehicleType !== "car") {
      return res
        .status(400)
        .json({ message: 'Invalid vehicle type. Must be "bike" or "car".' });
    }

    try {
      // Find the user (assuming you have a single user or a way to identify the user)
      const user = await UserModel.findOne({
        parking_vendor: req.user.parking_vendor,
      }); // Adjust the query as needed

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Extract the slots for the specified vehicle type
      const slots = user.layout[vehicleType];

      // Return the slots as a response
      res.status(200).json({ vehicleType, slots });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching slots", error: error.message });
    }
  }
);

customer_router.get("/getslots", tokenmiddleware, async (req, res) => {
  try {
    const vendor = await UserModel.findOne({
      parking_vendor: req.user.parking_vendor,
    });
    const customer_vehicle = await CustomerRecordModel.findOne({
      email_id: req.user.email_id,
    });
    const layout = vendor["layout"];
    const vehicles = customer_vehicle["vehicle"];
    const history = customer_vehicle["history"];
    if (!layout) {
      return res.status(400).json({ msg: "layout not found" });
    }

    res.json({ layout, vehicles, history });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

customer_router.put("/modify", tokenmiddleware, async (req, res) => {
  const {
    email,
    mobile,
    parkingslot,
    vehicle_number,
    vehicle_type,
    days_of_parking,
    vehicle_name,
    amount,
  } = req.body;
  try {
    console.log(req.user.id, req.user.email_id);

    const now = new Date();
    const expirationDate = new Date(
      now.getTime() + Number(days_of_parking) * 24 * 60 * 60 * 1000
    );
    const id = generateUniqueId();
    const modified = await CustomerRecordModel.findOneAndUpdate(
      { _id: req.user.id, email_id: req.user.email_id },
      {
        $push: {
          vehicle: {
            id: id,
            email: email,
            mobile: mobile,
            parking_slot: parkingslot,
            vehicle_name: vehicle_name,
            vehicle_type: vehicle_type,
            vehicle_number: vehicle_number,
            amount: amount,
            days_of_parking: days_of_parking,
            expiry_time: expirationDate,
            status: "unpaid",
          },
        },
      },
      { returnOriginal: false }
    );

    if (!modified) {
      return res.status(400).json({ msg: "Unable to modify" });
    }
    res.send({ modified });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

customer_router.get("/basic", tokenmiddleware, async (req, res) => {
  try {
    const customer_details = await CustomerRecordModel.findOne({
      email_id: req.user.email_id,
    });

    if (!customer_details) {
      return res.status(400).json({ msg: "Customer not found" });
    }

    let response_object = {
      email_id: customer_details["email_id"],
      phone_number: customer_details["phone_number"],
    };
    res.json(response_object);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
module.exports = customer_router;
