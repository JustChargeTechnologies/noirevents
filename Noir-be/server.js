// Reloading transporter with new credentials
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for memory storage (we'll attach the file directly)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with some hosting environments
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Configuration Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

// Routes
app.post('/api/book', upload.single('screenshot'), async (req, res) => {
  const { name, age, gender, entryType, phone } = req.body;
  const screenshot = req.file;

  if (!name || !phone || !entryType) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const mailOptions = {
    from: `"Noir Events" <${process.env.SMTP_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: `🎟️ New Booking: ${name} (${entryType})`,
    text: `New Booking: ${name}\nAge: ${age}\nGender: ${gender}\nEntry: ${entryType}\nPhone: ${phone}`,
    html: `
      <div style="background-color: #0c0c0c; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 600px; margin: auto; border-radius: 24px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff007f; font-weight: 900; letter-spacing: -1px; margin: 0; font-style: italic;">NOIR <span style="color: #ffffff;">EVENTS</span></h1>
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">New Booking Notification</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 30px; margin-bottom: 20px;">
          <div style="border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
            <p style="color: #ff007f; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0 0 5px 0;">Guest Name</p>
            <h2 style="margin: 0; font-size: 24px; font-weight: 800; font-style: italic;">${name}</h2>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0;">
                <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0;">Contact</p>
                <p style="margin: 5px 0 0 0; font-weight: 700;">${phone}</p>
              </td>
              <td style="padding: 10px 0;">
                <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0;">Category</p>
                <p style="margin: 5px 0 0 0; font-weight: 700; color: #00ecff;">${entryType}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0;">Age</p>
                <p style="margin: 5px 0 0 0; font-weight: 700;">${age}</p>
              </td>
              <td style="padding: 10px 0;">
                <p style="color: #666; font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0;">Gender</p>
                <p style="margin: 5px 0 0 0; font-weight: 700; text-transform: capitalize;">${gender}</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; color: #666; font-size: 11px;">
          <p>© 2026 NOIR EVENTS • UDHAMPUR</p>
          <p>Payment screenshot is attached to this email.</p>
        </div>
      </div>
    `,
    attachments: screenshot ? [
      {
        filename: screenshot.originalname,
        content: screenshot.buffer,
      },
    ] : [],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Booking sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
