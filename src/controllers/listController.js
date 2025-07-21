const List = require('../models/list');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.uploadList = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'File is required' });

        let contacts = [];

        if (file.mimetype === 'text/csv') {
            const results = [];
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (data) => {
                    if (data.email) {
                        results.push({
                            firstName: data.firstName || data.FirstName || '',
                            lastName: data.lastName || data.LastName || '',
                            email: data.email || data.Email,
                        });
                    }
                })
                .on('end', async () => {
                    contacts = results;

                    const newList = await List.create({
                        name,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        contacts,
                        createdBy: req.user._id,  // 🔥 Save uploader ID here!
                    });

                    fs.unlinkSync(file.path);
                    res.json(newList);
                });
        } else {
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            contacts = jsonData.map((row) => ({
                firstName: row.firstName || row.FirstName || '',
                lastName: row.lastName || row.LastName || '',
                email: row.email || row.Email,
            }));

            const newList = await List.create({
                name,
                fileName: file.originalname,
                fileType: file.mimetype,
                contacts,
                createdBy: req.user._id,  // 🔥 Save uploader ID here!
            });

            fs.unlinkSync(file.path);
            res.json(newList);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
};

exports.getLists = async (req, res) => {

    console.log('🧑‍💻 req.user:', req.user);

    const lists = await List.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(lists);
};

exports.deleteList = async (req, res) => {
    await List.findByIdAndDelete(req.params.id);
    res.json({ message: 'List deleted' });
};

exports.downloadList = async (req, res) => {
    const list = await List.findById(req.params.id);

    const worksheet = XLSX.utils.json_to_sheet(list.contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=${list.name}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
};


