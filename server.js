const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const exphbs = require('express-handlebars');
const database = require('./database.js');
const userModel = require('./models/users.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(session({secret: 'ssshhhhh'}));

//handlebars
app.engine('handlebars', exphbs({
 defaultLayout: 'main',
 extname: '.handlebars',
 layoutsDir: './views/layouts'
}));
app.set('view engine', 'handlebars');

app.locals.css = 'main.css'; //express local variables, works with handlebars

//routing
var sess;

//get
app.get('/',(req,res)=>{
    sess = req.session;
    if (sess.nickname){
        res.render('home',{nickname:sess.nickname});
    }
    else {
        res.render('login');
    }
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
      sess = req.session;
      const [nickname,password] = [req.body.nickname,req.body.password];
      const user = await userModel.findOne({nickname:nickname});
      const match = await bcrypt.compare(password,user.password);
      if(match){
        sess.nickname = nickname;
        res.redirect('/');
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
