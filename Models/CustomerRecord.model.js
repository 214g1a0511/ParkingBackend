const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    email_id: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    parking_vendor: { type: String, default: "" },
    vehicle: [
      {
        id: { type: String, default: "" },
        email: { type: String, default: "" },
        mobile: { type: String, default: "" },
        parking_slot: { type: String, default: "" },
        amount: { type: String, default: "" },
        vehicle_type: { type: String, default: "" },
        days_of_parking: { type: String, default: "" },
        vehicle_name: { type: String, default: "" },
        expiry_time: { type: String, default: "" },
        transaction_id: { type: String, default: "" },
        status: { type: String, default: "" },
      },
    ],
    parking: [],
    history: [],
  },
  { timestamps: true }
);

const CustomerRecordModel = mongoose.model("Parking@Customers", CustomerSchema);
module.exports = CustomerRecordModel;
