require("dotenv").config();
const cors = require("cors");
// require('express-async-errors');
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

const connectDB = require("./db/connect");
const articleRoutes = require("./routes/articles");
const imageeRoutes = require("./routes/images");
const NotFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const deleteImagesInBucket = require("./db/delete-images-in-bucket-daily");
const { generateAccessToken } = require("./auth/jwt-auth");
const populateAdmin = require("./db/migrations/populate-admin-data");
const User = require("./models/User");

// Create admin
populateAdmin();

//middleware
app.use(cors());
app.use(express.json());

//1000 * 60 * 60 * 24
// delete images in bucket every 24 hours
setInterval(deleteImagesInBucket, 1000 * 60 * 60 * 24);

//routes
app.use("/api/articles", articleRoutes);
app.use("/api/images", imageeRoutes);

app.post("/users/login", async (req, res) => {
	// Authenticate User
	const { username, password } = req.body;
	const user = await User.findOne({ username });

	if (!user) return res.status(400).send("Invalid username or password");
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).send("Invalid username or password");

	const accessToken = generateAccessToken(user);
	res.json({ accessToken: accessToken });
});

app.use(NotFoundMiddleware);
app.use(errorHandlerMiddleware);

// Mongo URI
const mongoURI = process.env.MONGO_URI;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

const port = process.env.PORT || 4000;

let address = "";

const start = async () => {
	await connectDB(mongoURI);
	app.listen(port, () => {
		console.log(`Server is running on port ${port}...`);
	});
};

start();
