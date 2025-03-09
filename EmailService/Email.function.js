const nodemailer = require("nodemailer");
const cron = require("node-cron");
const CustomerRecordModel = require("../Models/CustomerRecord.model");
const VehicleModel = require("../Models/Vehicles.model");

async function sendEmail(to, subject, text) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: text,
  };

  await transporter.sendMail(mailOptions);
}


async function scheduleExpirationCheck() {
  try {
    const now = new Date();

    const candidates = await VehicleModel.find({
      expiry_time: { $ne: "" },
    });

    console.log(candidates);

    for (const candidate of candidates) {
      try {
        const {
          email,
          mobile,
          parking_slot,
          vehicle_name,
          vehicle_type,
          vehicle_number,
          days_of_parking,
          expiry_time,
        } = candidate;

        const expiryDate = new Date(expiry_time);

        if (!isNaN(expiryDate)) {
          if (expiryDate < now) {
            const message = `
             <p>Dear Admin,</p>
              <p>The parking time for the following user has exceeded. Please verify and take necessary action:</p>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <th>Mobile</th>
                <th>Vehicle Type</th>
                <th>Vehicle Number</th>
                <th>Vehicle Name</th>
                <th>Slot Number</th>
                <th>Days Parked</th>
              </tr>
              <tr>
                <td>${mobile}</td>
                <td>${vehicle_type}</td>
                <td>${vehicle_number}</td>
                <td>${vehicle_name}</td>
                <td>${parking_slot}</td>
                <td>${days_of_parking}</td>
              </tr>
            </table>
            <p>Please take necessary action.</p>
            <p>Best regards,<br>Parking Management Team</p>
          `;
            candidate.expiry_time = "";
            await candidate.save();

            const useremail = `
            <p>Dear ${vehicle_name},</p>
            <p>Your parking time has exceeded. Below are the details of your parking slot:</p>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <th>Mobile</th>
                <th>Vehicle Type</th>
                <th>Vehicle Number</th>
                <th>Vehicle Name</th>
                <th>Slot Number</th>
                <th>Days Parked</th>
              </tr>
              <tr>
                <td>${mobile}</td>
                <td>${vehicle_type}</td>
                <td>${vehicle_number}</td>
                <td>${vehicle_name}</td>
                <td>${parking_slot}</td>
                <td>${days_of_parking}</td>
              </tr>
            </table>
            <p>Please take necessary action.</p>
            <p>Best regards,<br>Parking Management Team</p>
          `;

            await sendEmail(email, "Parking Time Exceeded", useremail);

            // Send the email
            await sendEmail(
              "bhanuchandchinta9@gmail.com",
              "Parking Time Exceeded",
              message
            );
            console.log(`Sent email to ${email}`);
          } else {
            console.log(`Candidate ${mobile} (${email}) has not yet expired.`);
          }
        } else {
          console.error(
            `Invalid expiry_time for candidate: ${mobile} (${email})`
          );
        }
      } catch (error) {
        console.error(
          `Error processing candidate: ${candidate.mobile} (${candidate.email})`,
          error
        );
      }
    }

    console.log("Expired timestamps processed.");
  } catch (error) {
    console.error("Unable to send email:", error);
  }
}


module.exports = { scheduleExpirationCheck };
