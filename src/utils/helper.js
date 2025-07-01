const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const fs = require("fs");
const fastcsv = require("fast-csv");
const path = require("path")
const aws = require('aws-sdk')

const s3 = new aws.S3({
  accessKeyId: process.env.LINODE_ACCESS_KEY,
  secretAccessKey: process.env.LINODE_SECRET_KEY,
})

exports.success = (message = '', data = {}, code = 200) => {
  return {
    error: false,
    message,
    data,
    code
  }
}

exports.error = (message = '', data = {}, code = 500) => {
  return {
    error: true,
    message,
    data,
    code
  }
}

exports.validation = (data = {}) => {
  return {
    error: true,
    message: 'Bad Request',
    code: 400,
    data
  }
}

exports.JoiParseError = (error) => {
  return error.details[0].message.replace(/[^a-zA-Z0-9 ]/g, '')
}
exports.errorRes = (res, message = '', data = {}, code = 400) => {
  res.status(code).send({
    error: true,
    message,
    data,
    code
  })
  return;
}

exports.errorExist = (res, message = '', data = {}, code = 403) => {
  res.status(code).send({
    error: true,
    message,
    data,
    code
  })
  return;
}

exports.bycryptpassverify = async (password, hash) => {
  return await bycrypt.compare(password, hash);
}

exports.jwtSign = async (payload) => {
  return await jwt.sign(payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY })
}

exports.jwtVerify = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET)
}


exports.generatecsv = async (filename, keys, data) => {
  try {

    let values = []
    data.forEach(ele => {
      let object = []
      keys.forEach(key => {
        if (ele[key.toLocaleLowerCase()]) object.push(ele[key.toLocaleLowerCase()])
        else if (key == 'Sort') {
          object.push(ele['order_no'])
        }
        else if (key == "Time") {
          object.push(ele['start_date'])
        }
        else if (key == "Seo Url") {
          object.push(ele['seo_url'])
        }
        else object.push('')
      });
      values.push(object)
    });
    let rows = [keys, ...values]

    let filepath = path.join(__dirname, "../../uploads/csvfiles/" + filename)
    let ws = fs.createWriteStream(filepath)
    await new Promise((resolve, reject) => {
      fastcsv.write(rows, { headers: true })
        .pipe(fs.createWriteStream(filepath))
        .on('finish', () => {
          console.log('CSV created successfully');
          resolve(filepath);
        })
        .on('error', (err) => {
          console.log('Error in CSV creation:', err);
          reject(err);
        });
    });
    return filepath;
  } catch (error) {
    console.log(error)
    return false
  }
}
exports.uploadfileToS3 = async (filepath, filename, key = 'csv', ContentDisposition = "") => {
  try {
    let stored = await s3.upload({
      ContentDisposition: 'attachment',
      Bucket: process.env.LINODE_BUCKET,
      Body: fs.readFileSync(filepath),
      Key: key + '/' + filename
    }).promise()
    return stored.Location
  } catch (error) {
    console.log(error);
    return false
  }
}

exports.dateFilter = async (startDate = "", endDate = "", type = 0) => {
  try {
    let dateFilter = {}
    switch (type) {
      case 1:
        dateFilter = {
          $gte: new Date(moment(startDate).clone().startOf('day')),
          $lt: new Date(moment(startDate).clone().endOf('day'))
        }

        break;

      case 2:
        dateFilter = {
          $gte: new Date(moment(startDate).clone().startOf('day')),
          $lt: new Date(moment(endDate).clone().endOf('day'))
        }
        break;

      default:
        dateFilter = {
          $gte: new Date(moment(startDate).clone().startOf('day')),
          $lt: new Date(moment(startDate).clone().endOf('day'))
        }
        break;
    }
    return dateFilter;
  } catch (error) {
    console.log(error)
    return {}
  }
}