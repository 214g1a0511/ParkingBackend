const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User.model');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { email_id, phone_number, password, full_name, parking_vendor, layout } = req.body;

    try {
        // Create an array of slots for bike
        const bikeSlots = Array.from({ length: parseInt(layout.bike.slot) }, (_, index) => ({
            slot: `B${index + 1}`,
            booked: false
        }));

        // Create an array of slots for car
        const carSlots = Array.from({ length: parseInt(layout.car.slot) }, (_, index) => ({
            slot: `C${index + 1}`,
            booked: false
        }));

        // Create a new user with the generated slots
        const newUser = new UserModel({
            email_id,
            parking_vendor,
            phone_number,
            password,
            full_name,
            layout: {
                bike: bikeSlots,
                car: carSlots
            }
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email_id, password } = req.body;

    try {
        let user = await UserModel.findOne({ email_id });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // const isMatch = await bcrypt.compare(password, user.password);
        if (password !== user.password && email_id !== user.email_id) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                email_id: user.email_id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get("/getslots", async (req, res) => {
    try {

    } catch (error) {

    }
})

module.exports = router;
