const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    parking_slot: { type: String, required: true },
    vehicle_name: { type: String, required: true },
    vehicle_type: { type: String, required: true },
    vehicle_number: { type: String, required: true },
    amount: { type: String },
    hours_of_parking: { type: Number, required: true },
    expiry_time: { type: String },
    status: { type: String, default: "unpaid" },
  },
  { timestamps: true }
);

const VehicleModel = mongoose.model("Parking@Vehicles", VehicleSchema);
module.exports = VehicleModel;
