const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

// Middleware
app.use(bodyParser.json({ limit: "10mb" })); // To handle large chart images
app.use(cors());

// Email route
app.post("/send-email", async (req, res) => {
    const { email, chartImage, dataSummary } = req.body;
    console.log("send mail works Received email request:", { email, chartImageLength: chartImage?.length, dataSummaryLength: dataSummary?.length });
    if (!email || !chartImage || !dataSummary) {
        console.error("Missing required fields:", { email, chartImage, dataSummary });
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        console.log("Sending email to:", email);
        console.log("Chart image size:", chartImage.length);
        console.log("Data summary:", dataSummary);
        console.log("Loaded credentials:", {
            emailUser: process.env.EMAIL_USER,
            resendApiKey: process.env.RESEND_API_KEY,
        });


        const transporter = nodemailer.createTransport({
            host: "smtp.resend.com",
            port: 587,
            auth: {
                user: 'resend',
                pass: process.env.RESEND_API_KEY,
            },
            debug: true, // Enable debug output
            logger: true, // Log SMTP traffic
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Income and Expense Chart",
            html: `
        <h3>Here is your chart and data summary:</h3>
        <p>${dataSummary.replace(/\n/g, "<br>")}</p>
        <img src="cid:chartImage" alt="Chart" style="max-width: 100%; height: auto;">
    `,
            attachments: [
                {
                    filename: "chart.png", // Name of the file attachment
                    content: chartImage.split(",")[1], // Remove the "data:image/png;base64," prefix
                    encoding: "base64", // Specify the encoding
                    cid: "chartImage", // Content-ID for referencing in the email body
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);