const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { FileDirectoryType } = require("../utils/const");

const fileFilter = (req, file, cb) => {
    const fileType = req?.query?.type;

    if (fileType === "invoice" || fileType === "template") {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Invalid file type. Only PDF allowed."));
        }
    }

    cb(null, true);
};

const storageData = multer.diskStorage({
    destination: (req, file, cb) => {
        const { type } = req.query;

        const uploadPath = FileDirectoryType[type]
            ? `./uploads${FileDirectoryType[type]}`
            : null;

        if (!uploadPath) return cb(new Error("Invalid file type"));

        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const { fileId } = req.query;
        const baseName = fileId ? `file_${fileId}` : file.fieldname;
        cb(null, `${baseName}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storageData,
    fileFilter,
});

module.exports = upload;
