const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please enter an article title"],
	},
	content: {
		type: String,
		required: [true, "Please enter an article content"],
	},
    images: [
        // {
        //     fileId: { type: String, required: [true, "Image id is required"] },
        //     fileUrl: { type: String, required: [true, "Image url is reqired."] },
        //     isPreview: { type: Boolean, required: [true, "isPreview Boolean type is required."] }
        // }
		{
			length: { type: Number, required: [true, "length of image is required"] },
			filename: { type: String, required: [true, "Image name is required"] },
			contentType: { type: String, required: [true, "Content type is required"] },
			// file: { type: Buffer, required: [false, "file data is required"] },
			fileId: { type: mongoose.SchemaTypes.ObjectId },
			isPreview: { type: Boolean, default: false},
			uploadDate: { type: Date, default: Date.now },
		}
    ],
	tags: {
		type: Array,
		required: [true, "Please enter an tag"],
	},
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);