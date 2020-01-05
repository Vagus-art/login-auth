const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const exphbs = require('express-handlebars');
const database = require('./database.js');
const userModel = require('./models/users.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

//middleware
app.use('/register',bodyParser.urlencoded({ extended: true }));

//handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


//routing
//get
app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/about', async (req,res)=>{
    const db = await userModel.find();
    res.render('about',{data:db.filter(element=>element.toObject().hasOwnProperty('nickname'))});
})

app.get('/api',async (req,res)=>{
    const db = await userModel.find();
    res.json(db);
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

//post
app.post('/register',async (req,res)=>{
    try {
        const pass = await bcrypt.hash(req.body.password, 10);
        const user = new userModel({nickname:req.body.nickname,password:pass,email:req.body.email});
        user.save().then(response=>res.redirect('/about'));
    }
    catch {
        res.send('there has been an error encrypting your password');
    }
    
})

app.listen(port,()=>console.log(`Server running on port ${port}`));