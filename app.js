const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const router = require("./Routes/Authentication.router");
const customer_router = require("./Routes/CustomerParking.router");
const cron = require("node-cron");
const cors = require("cors");
const { scheduleExpirationCheck } = require("./EmailService/Email.function");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", router);
app.use("/customer", customer_router);

const now = new Date();
console.log(now);
cron.schedule("* * * * *", () => {
  console.log("Running cron job to check expired timestamps");
  // scheduleExpirationCheck();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
