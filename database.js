const mongoose = require('mongoose');
//localhost
//const connection = mongoose.connect("mongodb://localhost:27017/login-auth",()=>console.log('Database connected'))

//atlas
const connection = mongoose.connect("mongodb+srv://test:case@musicality-v04uq.mongodb.net/test?retryWrites=true&w=majority",()=>console.log('Database connected'))
module.exports = connection;