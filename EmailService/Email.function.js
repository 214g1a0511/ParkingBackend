const nodemailer = require('nodemailer');
const cron = require('node-cron');
const CustomerRecordModel = require('../Models/CustomerRecord.model');

async function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    await transporter.sendMail(mailOptions);
}

// async function scheduleExpirationCheck() {
//     try {
//         const now = new Date();
//         const candidates = await CustomerRecordModel.find({
//             'expiry_time': { $ne: "", $gt: now }
//         });
//         console.log(candidates)
//         if (candidates.length > 0) {
//             for (const candidate of candidates) {
//                 const { email, name } = candidate;
//                 const message = `Dear ${name}, your parking time has exceeded. Please take necessary action.`;
//                 candidate["expiry_time"] = ""
//                 await candidate.save();
//                 await sendEmail("bhanuchandchinta9@gmail.com", 'Parking Time Exceeded', message);
//                 console.log(`Sent email to ${email}`);
//             }
//             console.log(`Sent emails for ${candidates.length} expired records`);
//         } else {
//             console.log('No expired records found');
//         }


//     } catch (error) {
//         console.error('Unable to send email:', error);
//     }
// }

async function scheduleExpirationCheck() {
    try {
        const now = new Date();

        // Retrieve all records with non-empty expiry_time
        const candidates = await CustomerRecordModel.find({
            expiry_time: { $ne: "" }
        });

        console.log(candidates);

        for (const candidate of candidates) {
            const { email, full_name, expiry_time } = candidate;

            // Parse the expiry_time string into a Date object
            const expiryDate = new Date(expiry_time);

            // Check if the parsed date is valid and less than the current date
            if (!isNaN(expiryDate) && expiryDate < now) {
                const message = `Dear ${full_name}, your parking time has exceeded. Please take necessary action.`;

                // Clear the expiry_time
                candidate.expiry_time = "";
                await candidate.save();

                // Send the email
                await sendEmail("bhanuchandchinta9@gmail.com", 'Parking Time Exceeded', message);
                console.log(`Sent email to ${email}`);
            }
        }

        console.log('Expired timestamps processed.');
    } catch (error) {
        console.error('Unable to send email:', error);
    }
}



// cron.schedule('* * * * *', () => {
//     console.log('Running cron job to check expired timestamps');
//     scheduleExpirationCheck();
// });

module.exports = { scheduleExpirationCheck }