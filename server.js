const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const exphbs = require('express-handlebars');
const database = require('./database.js');
const userModel = require('./models/users.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
//handlebars
app.engine('handlebars', exphbs({
 defaultLayout: 'main',
 extname: '.handlebars',
 layoutsDir: './views/layouts'
}));
app.set('view engine', 'handlebars');

app.locals.css = 'main.css'; //express local variables, works with handlebars
app.locals.omg = 'omg this is awesome';

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

});
app.post('/login', async (req,res)=>{
    try{
      const [nickname,password] = [req.body.nickname,req.body.password];
      const user = await userModel.findOne({nickname:nickname});
      const match = await bcrypt.compare(password,user.password);
      if(match){
        res.send(`welcome ${nickname}!`);
      }
      else{
        res.redirect('/login');
      }
    }
    catch(error){
      console.log(error);
    }
})

app.listen(port,()=>console.log(`Server running on port ${port}`));
