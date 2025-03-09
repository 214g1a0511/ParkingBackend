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
        id: { type: String, default: "" }
      },
    ],
    parking: [],
    history: [],
  },
  { timestamps: true }
);

const CustomerRecordModel = mongoose.model("Parking@Customers", CustomerSchema);
module.exports = CustomerRecordModel;
