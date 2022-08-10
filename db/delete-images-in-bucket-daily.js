const mongoose = require('mongoose');


let gridfsBucket; // declare one more variable with name gridfsBucket
const conn = mongoose.connection;
conn.on("error", console.error.bind(console, "connection error:"));
conn.once("open", () => {
	// Add this line in the code
	gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: "images_uploads",
	});
});

const deleteImagesInBucket = async() => {
    console.log('deleteImagesInBucket')
    const images = await gridfsBucket.find({uploadDate: {$lt: new Date(Date.now() - 1000 * 60 * 60 * 18)}}).sort({uploadDate: 1}).toArray();
    images.forEach(async(image) => {
        await gridfsBucket.delete(image._id);
    })
    // console.log(images, images.length);

}

module.exports = deleteImagesInBucket;