const express = require("express");
const router = express.Router();

const {authenticateToken} = require("../auth/jwt-auth");
const {
	getArticles,
	getArticle,
	createArticle,
	updateArticle,
	deleteArticle,
	getArticleImage
} = require("../controllers/articles");

router.route("/").get(getArticles).post(authenticateToken, createArticle);
router.route("/:id").get(getArticle).patch(authenticateToken, updateArticle).delete(authenticateToken, deleteArticle);

//get image
router.route("/images/:filename").get(getArticleImage);

module.exports = router;
