const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "noreplyxava@gmail.com",
    pass: "sskl vsvr izro kgcm"
  }
});

function sendEmail(mailOptions) {


  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };