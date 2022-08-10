const express = require("express");
const router = express.Router();

const {
    getImages,
    createImage,
    getImage,
    getImageAddress,
    deleteImage,
    deleteImages,
    upload
} = require("../controllers/images")

const {authenticateToken} = require("../auth/jwt-auth");


router.route("/").get(getImages).post([authenticateToken, upload.single('image')],createImage).delete(authenticateToken, deleteImages);

//get image stream in images_uploads
router.route("/:filename").get(getImage);

router.route("/:id").delete(authenticateToken, deleteImage);
router.route("/:id/address").get(getImageAddress);

module.exports = router;