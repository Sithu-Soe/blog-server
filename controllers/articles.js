const mongoose = require('mongoose');
const Article = require("../models/Article");
const ImageModel = require("../models/ImageModel");
const { createCustomError } = require("../errors/custom-error");
const { GridFsStorage } = require('multer-gridfs-storage');
const grid = require("gridfs-stream");
const fs = require('fs')

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

const getArticles = async (req, res) => {
	const articles = await Article.find({});
	res.status(200).json(articles);
};

const getArticle = async (req, res, next) => {
	const { id } = req.params;
	const article = await Article.findById(id);
	if (!article) {
		return next(createCustomError(`Article with id: ${id} not found`, 404));
	}
	// if (!article) throw Error(`Article with id: ${id} not found`, 404);
	res.status(200).json(article);
};


const getImageDatas = (bucketImages, images) => {

	let imageDatas =  [];
	for (const [index, image] of bucketImages.entries()){

		const stream = gridfsBucket.openDownloadStreamByName(image.filename);
	
		let chunks = [];
		stream.on("data", (chunk) => {
			chunks.push(chunk);
		});

		const imageData = {
			_id: image._id,
			filename: image.filename,
			length: image.length,
			contentType: image.contentType,
			// file: chunks
			file: null,
			isPreview: images[index]?.isPreview,
		};
		

		stream.on("end", () => {
			if (image.length === chunks[0].length) {
				imageData.file = chunks[0]
				imageDatas.push(imageData)
			}
		})
	}

	return new Promise(resolve => {
		setTimeout(() => {
			resolve(imageDatas);
		}, bucketImages.length * 300);
	})

	
};

const createImages = (files, filenames) => {
	return new Promise(resolve => {
		let ids = [];
		files.forEach(async(file, index) => {
			const image = await new ImageModel({ file, filename: filenames[index] }).save();
			ids.push(image._id)
		})
		setTimeout(() => {
			resolve(ids);
		}, files.length * 200);
	})
}

const createArticle = async (req, res) => {
	const {images} = req.body
	delete req.body.images
	const pattern = /<img\s+[^>]*src="([^"]*)"[^>]*>/g;
	const imageTags = req.body.content.match(pattern);
	// const article = await Article.create(req.body);
	const article = await new Article(req.body);

	article.images = images
	if(imageTags?.length > 0 && imageTags) {
		let imageNames = [];
		for (let i = 0; i < imageTags.length; i++) {
			const imageTag = imageTags[i];
			const imageUrl = imageTag.match(/src="([^"]*)"/)[1];
			const imageName = imageUrl.split("/").pop();
			imageNames.push(imageName);

			//'http://localhost:4000/api/articles/images/9cfe2e7ffe15dfa67bb5249c5d8a2d62.jpg'

			const baseUrl = req.protocol + "://" + req.get("host");

			const imageTagReplaced = imageTag.replace(
				imageUrl,
				`${baseUrl}/api/articles/images/${imageName}`
			);
			req.body.content = req.body.content.replace(imageTag, imageTagReplaced);
		}

		//Find in GridFsBucket
		const bucketImages = await gridfsBucket
			.find({ filename: { $in: imageNames } })
			.toArray();

		let imageDatas = await getImageDatas(bucketImages, images);

		let filenames = []

		const files = imageDatas.map(imageData => {
			const { file, filename } = imageData;
			filenames.push(filename)
			delete imageData.file
			return file;
		});
		const fileIds = await createImages(files, filenames);

		imageDatas.map(imageData => {
			imageData.fileId = fileIds[imageDatas.indexOf(imageData)]
		})

		article.images = imageDatas

		article.save();
		return res.json(article);
	}else {
		article.save();		
		return res.json(article);
	}
};

const updateArticle = async (req, res, next) => {
    const { id } = req.params;
    const article = await Article.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })
    if (!article) {
        return next(createCustomError(`Article with id: ${id} not found`, 404));
    }
	res.status(200).json(article);
};

const deleteArticle = async (req, res, next) => {
    const { id } = req.params;
    const article = await Article.deleteOne({_id: id})
    //{ acknowledged: true, deletedCount: 0 }
    if (!article.deletedCount) {
		return next(createCustomError(`Article with id: ${id} not found`, 404));
	}
    res.status(200).json(article)
};

const getArticleImage = async (req, res, next) => {
	const { filename } = req.params;
	const image = await ImageModel.findOne({ file: filename });
	if (!image) {
		return next(createCustomError(`Image with filename: ${filename} not found`, 404));
	}
	const stream = gridfsBucket.openDownloadStreamByName(filename);
	stream.pipe(res);
}

module.exports = {
	getArticles,
	getArticle,
	createArticle,
	updateArticle,
	deleteArticle,
	getArticleImage,
};
