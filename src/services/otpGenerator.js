const helperUtils = require("../utils/helper");
const { ERROR_MSG } = require("../utils/const");
const db = require("../utils/mongooseMethods");
const models = require("../utils/modelName");
const emailsend = require("./emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 
const OtpGenerator =  async (email,req, res) => {
    try {
        // console.log("email",email);
        // console.log("Sending OTP to:", email);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
 
        await db.deleteMany({
            collection: models.OTP,
            query: { email }
        });
    
        let input = {
            collection: models.OTP,
            document: { email, otp: hashedOtp, createdAt: Date.now() }
        };
        
        const insertedOTP = await db.insertOne(input);
        // console.log("DB Insert Result:", insertedOTP);
        if(!insertedOTP){
            return helperUtils.errorRes(res, "Otp not created", {});
        }
      const Verification_Email_Template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 30px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #ddd;
                }
                .header {
                    background-color:rgb(85, 91, 172);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    font-size: 26px;
                    font-weight: bold;
                }
                .content {
                    padding: 25px;
                    color: #333;
                    line-height: 1.8;
                }
                .verification-code {
                    display: block;
                    margin: 20px 0;
                    font-size: 22px;
                    color:rgb(82, 98, 170);
                    background: #e8f5e9;
                    border: 1px dashedrgb(52, 78, 126);
                    padding: 10px;
                    text-align: center;
                    border-radius: 5px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                .footer {
                    background-color: #f4f4f4;
                    padding: 15px;
                    text-align: center;
                    color: #777;
                    font-size: 12px;
                    border-top: 1px solid #ddd;
                }
                p {
                    margin: 0 0 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Verify Your Email</div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
                    <span class="verification-code">${otp}</span>
                    <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
                </div>
                <div class="footer">
                    <p> Your Company. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            html: Verification_Email_Template

        };
        // console.log("mailOptions",mailOptions);
        const emailResponse = await emailsend.sendEmail(mailOptions);
        if (!emailResponse) {
            return helperUtils.errorRes(res, "Failed to send OTP email", {});
        }

        // console.log("OTP successfully sent to:", email);
        return true;

    } catch (error) {
      console.error("Error in OtpGenerator:", error);
      return false; // explicitly return false on failure
    }
  };
 
module.exports = {
    OtpGenerator
};