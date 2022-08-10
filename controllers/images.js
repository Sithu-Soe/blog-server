const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const grid = require("gridfs-stream");
const ObjectId = require("mongodb").ObjectId;

const { createCustomError } = require("../errors/custom-error");

const mongoURI = process.env.MONGO_URI;
// const conn = mongoose.createConnection(mongoURI);
// // Init gfs
// let gfs;

// conn.once("open", () => {
// 	// Init stream
// 	gfs = Grid(conn.db, mongoose.mongo);
// 	gfs.collection("uploads");
// 	console.log("Connected to HH");
// });

// https://mongodb.github.io/node-mongodb-native/3.1/api/GridFSBucket.html

let gfs, gridfsBucket; // declare one more variable with name gridfsBucket
const conn = mongoose.connection;
conn.on("error", console.error.bind(console, "connection error:"));
conn.once("open", () => {
	// Add this line in the code
	gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: "images_uploads",
	});
	gfs = grid(conn.db, mongoose.mongo);
	gfs.collection("images_uploads");
});

const storage = new GridFsStorage({
	url: mongoURI,
	file: (req, file) => {
		if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
			console.log("not an image");
			throw new Error("only jpg, png is allowed");
		}
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}
				const filename = buf.toString("hex") + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: "images_uploads",
				};
				resolve(fileInfo);
			});
		});
	},
});
const upload = multer({ storage }, () => {
	console.log("upload");
});

const getImages = async (req, res) => {
	try {
		const images = await gridfsBucket
			.find()
			.sort({ uploadDate: -1 })
			.limit(10)
			.toArray();
		res.json(images);
	} catch (error) {
		res.status(404).json({ err: error });
	}
};

const getImage = async (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: "No file exists",
			});
		}

		//Check if image
		if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
			// Read output to browser
			// res.json({ fileUrl: req.params.filename });
			const readStream = gridfsBucket.openDownloadStream(file._id);
			readStream.pipe(res);
		} else {
			res.status(404).json({
				err: "Not an image",
			});
		}
	});
};

const getImageAddress = async (req, res) => {
	gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: "No file exists",
			});
		}
		// File exists
		return res.json(file);
	});
};

const createImage = async (req, res) => {
	var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
	// const ipAddress = req.socket.remoteAddress;
	// console.log(req.file, 'req.file');
	res.json({
		fileUrl: `${fullUrl}/${req.file.filename}`,
		fileName: req.file.filename,
		fileId: req.file.id,
	});
};

const deleteImage = async (req, res) => {
	gfs.files.findOne({ _id: ObjectId(req.params.id) }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: "No file exists",
			});
		}
		// get id
		const id = file._id;
		gridfsBucket.delete(id);
		res.json({ message: "File deleted successfully!" });
	});
};

const deleteImages = async (req, res, next) => {
	const { ids } = req.body;
	if (ids.length > 0 && ids) {

		for(let i = 0; i < ids.length; i++) {
			try {
				const document = await gfs.files.findOne({ _id: ObjectId(ids[i]) });
				if (document) {
					gridfsBucket.delete(document._id);
				} else {
					return res.status(404).json({msg: "File not found with id: " + ids[i]});
				}
			} catch (error) {
				return next(error)
				// return res.status(404).json({msg: error.message});
			}

		}
		return res.json({ message: "File deleted successfully!" });
	}
	return res.status(400).json({ message: "Please provide ids of images" });
};

module.exports = {
	getImages,
	createImage,
	getImage,
	getImageAddress,
	deleteImage,
	deleteImages,
	upload,
};
