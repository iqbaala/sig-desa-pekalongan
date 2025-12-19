const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log("Testing Email Configuration...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("ERROR: EMAIL_USER or EMAIL_PASS is missing in .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'miqbalm511@gmail.com',
            subject: 'Test Email from LabTanam Backend',
            text: 'If you receive this, your backend email configuration is working correctly!'
        });
        console.log("SUCCESS: Email sent!", info.messageId);
    } catch (error) {
        console.error("FAILURE: Could not send email.");
        console.error(error);
    }
}

testEmail();
