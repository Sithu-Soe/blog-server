require('dotenv').config();
const connectDB = require('../connect');
const bcrypt = require('bcrypt');

const User = require('../../models/User');

const populateAdmin = async()=> {
    console.log('Populating Admin')
    try {
        await connectDB(process.env.MONGO_URI)
        const user = await User.findOne({role: 'admin'})
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
        // await User.deleteMany({});
        if(!user) {
            const newUser = new User({
                name: 'admin',
                username: 'sithu-strange',
                email: 'soesithu908@gmail.com',
                password: hashedPassword,
                role: 'admin',
            });
            await newUser.save();
            console.log(newUser)
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = populateAdmin