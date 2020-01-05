const mongoose = require('mongoose');
const userSchema = {
    nickname:String,
    password:String,
    email:String
}
const userModel = new mongoose.model('user',userSchema);
module.exports = userModel;