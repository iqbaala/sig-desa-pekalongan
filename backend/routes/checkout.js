const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Helper to send email
async function sendOrderEmail(orderData, status = 'Pesanan Baru') {
    // Configure Transporter - User needs to fill this in .env
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // e.g. miqbalm511@gmail.com
            pass: process.env.EMAIL_PASS  // App Password
        }
    });

    const mailOptions = {
        from: `"LabTanam Store" <${process.env.EMAIL_USER}>`,
        to: 'miqbalm511@gmail.com', // Admin email as requested
        subject: `[${status}] ${orderData.product_name} - ${orderData.customer_name}`,
        html: `
            <h2>${status}</h2>
            <p><strong>Customer:</strong> ${orderData.customer_name}</p>
            <p><strong>Alamat:</strong> ${orderData.customer_address}</p>
            <p><strong>Metode Bayar:</strong> ${orderData.payment_method}</p>
            <hr>
            <h3>Produk</h3>
            <p><strong>Nama:</strong> ${orderData.product_name}</p>
            <p><strong>Jumlah:</strong> ${orderData.qty}</p>
            <p><strong>Total Harga:</strong> Rp ${orderData.total_price.toLocaleString('id-ID')}</p>
            <br>
            <p><em>Waktu: ${new Date().toLocaleString('id-ID')}</em></p>
        `
    };

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Skipping email: EMAIL_USER or EMAIL_PASS not set in .env");
            return false;
        }
        await transporter.sendMail(mailOptions);
        console.log("Email sent to miqbalm511@gmail.com");
        return true;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
}

router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Received Order:", orderData);

        // Initial "Pending" email
        const emailSent = await sendOrderEmail(orderData, 'Menunggu Pembayaran');

        res.status(200).json({
            success: true,
            message: 'Order received',
            email_sent: emailSent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/confirm', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Payment Confirmation Request Received");
        console.log("Debug Email Env:", {
            user_set: !!process.env.EMAIL_USER,
            pass_set: !!process.env.EMAIL_PASS,
            user_val: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'null'
        });
        console.log("Payment Confirmation Data:", orderData);

        // Confirmation email
        const emailSent = await sendOrderEmail(orderData, 'Konfirmasi Pembayaran');

        res.status(200).json({
            success: true,
            message: 'Payment confirmation received',
            email_sent: emailSent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
