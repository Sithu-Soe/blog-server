const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    file: { type: Buffer, required: [true, "file data is required"] },
    filename: { type: String, required: [true, "Image name is required"] },
});

module.exports = mongoose.model('Images', imageSchema);