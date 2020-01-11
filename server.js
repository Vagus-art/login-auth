const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const exphbs = require('express-handlebars');
const database = require('./database.js');
const userModel = require('./models/users.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const uuid = require('uuid');

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(session({
    genid: ()=>uuid(),
  secret: 'ssshhhhh'}));

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
    if (req.session.nickname){
        res.redirect('/');
    }
    else{
        res.render('register');
    }
})

app.get('/login',(req,res)=>{
    if (req.session.nickname){
        res.redirect('/');
    }
    else{
        res.render('login');
    }
})

app.get('/logout',(req,res)=>{
    sess = req.session;
    req.session.destroy((err)=>console.log(err));
    res.redirect('/login');
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
        if(user){
            const match = await bcrypt.compare(password,user.password);
            if(match){
            sess.nickname = nickname;
            res.redirect('/');
            }
            else{
            res.render('login',{message:"Password invalid!"});
            }
        }
        else{
            res.render('login',{message:'Nickname not found!'})
        }
    }
    catch(error){
      console.log(error);
    }
})
app.post('/changepass', async (req,res)=>{
    try{
        sess = req.session;
        const [oldpassword,password] = [req.body.oldpassword,req.body.password];
        const user = await userModel.findOne({nickname:sess.nickname});
        if(user){
            const match = await bcrypt.compare(oldpassword,user.password);
            if(match){
                user.password = await bcrypt.hash(password, 10);
                user.save();
                res.redirect('/');
                }
                else{
                res.render('home',{message:"Password invalid!"});
                }
            }
            else{
                req.session.destroy();
                res.render('login',{message:'Nickname not found!'})
            }
        }
        catch(error){
          console.log(error);
        }
    })


app.listen(port,()=>console.log(`Server running on port ${port}`));
