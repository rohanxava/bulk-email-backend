const mongoose = require("mongoose");
const winston = require("winston");

module.exports = async () => {
  mongoose.connect(process.env.DB_URL)
    .then(() => {
      console.log("DB connected")
      winston.info("connectedd to database")
    });
  mongoose.set('debug', true)
}