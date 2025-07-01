// const helperUtils = require("../utils/helper");
// const { ERROR_MSG } = require("../utils/const");
// const db = require("../utils/mongooseMethods");
// const models = require("../utils/modelName");
// const emailsend = require("../services/emailService");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.verifyOtp = async (req, res) => {
//     try {
//         // console.log("req body", req?.body);
//         // console.log("verifyOtp called");
//         const { email, otp } = req.body;
//         // console.log("Verifying OTP for:", email, "OTP:", otp);

//         let record = await db.findOne({
//             collection: models.OTP,
//             query: { email }
//         });

//         console.log("DB Record:", record);

//         if (!record) return res.send(helperUtils.error("OTP expired or invalid", {}));

//         const isMatch = await bcrypt.compare(otp, record.otp);
//         console.log("OTP Match:", isMatch);
//         if (!isMatch) return res.send(helperUtils.error("Invalid OTP", {}));

//         await db.deleteOne({
//             collection: models.OTP,
//             query: { email },
            
//         });
//         await db.updateOne({
//             collection: models.User,
//             query: { email: email.toLowerCase() },
//             update: { $set: { isVerifiedotp: true, otpVerifiedAt: new Date() } },
//           });

//         const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
//         res.send(helperUtils.success("OTP verified and logged in", { token }));
//     } catch (error) {
//         console.error("Internal Server Error:", error);
//         helperUtils.errorRes(res, "Internal Server Error", {}, 500);
//     }
// };