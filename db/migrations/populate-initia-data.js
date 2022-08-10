require('dotenv').config();
const connectDB = require('../connect');
const Article = require('../../models/Article');

const articles = require('../dummy-data/articles.json');

const populate = async()=> {
    try {
        await connectDB(process.env.MONGO_URI)
        await Article.deleteMany({});
        console.log('deleted articles')
        await Article.insertMany(articles);
        console.log('created articles')
        const data = await Article.find();
        console.log(data, 'dd')
        process.exit();
        
    } catch (error) {
        console.log(error)        
        process.exit(0);
    }
}

populate();