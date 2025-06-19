const express = require('express')
const cors = require('cors')
const Routes = require('../routes')
const fs = require("fs");
const { FileDirectoryType } = require("../utils/const")


module.exports = (app) => {
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true }))

    app.use(cors())
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })

    const fileAttachment = (req, res, next) => {
        // res.header('Content-Type', 'application/octet-stream')
        // res.header('Content-Disposition', 'attachment')
        next()
    }
    app.use('/uploads', fileAttachment, express.static('uploads'))
    // Serve static files from the 'public' directory
    app.use(express.static('public'));

    // routes
    app.use('/api', Routes)

    app.get('/', (req, res) => {
        const ip =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null)
        const toSave = {
            ipAddress: ip,
            time: Date.now()
        }
        res.send(toSave)
    })

    // intializeUploadFolders
    fs.existsSync('./uploads') || fs.mkdirSync('./uploads')
    Object.values(FileDirectoryType).forEach((file) => {
        fs.existsSync('./uploads' + file) || fs.mkdirSync('./uploads' + file, { recursive: true })
    })
}
