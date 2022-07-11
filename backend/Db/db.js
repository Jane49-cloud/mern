require('dotenv').config()
const mongoose = require('mongoose')
const connection =async ()=>{
    const db = {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, db)
        console.log("database connected")
    } catch (error) {
        console.log( error, "Connection to the database failed")
    }
}
module.exports = connection

