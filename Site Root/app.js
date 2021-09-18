if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const session = require('express-session')
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');

//connect to db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(err => {
        console.log("Mongo connection ERROR")
        console.log(err)
    })

//init app
const app = express();

//view enigne setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

// set global errors variable
app.locals.errors = null;

//Express fileupload middleware
app.use(fileUpload());

//body-parser middleware

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
// parse application/json
app.use(express.json());

// Express session middleware 
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }))

// Express validator middleware
app.use(expressValidator({
    // errorFormatter: function(param, msg, value){
    //     const namespace = param.split('.'),
    //     root = namespace.shift(),
    //     formParam = root;
    //      while(namespace.length){
    //          formParam += '[' + namespace.shift() + ']';
    //      }
    //      return {
    //         param: formParam,
    //         msg: msg,
    //         value, value
    //      };
    // },
    CustomValidators: {
        isImage: function(value, filename) {
            const extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case  '.png':
                    return '.png';
                default:
                    return false;
            }
        }
    }

}));


// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.get('/', (req,res)=> {
    res.render('index',{
    title: 'Home'
    });
})

//Set routes
const pages = require('./routes/pages.js');
const adminPages = require('./routes/admin_pages.js');
const adminCategories = require('./routes/admin_categories.js');
const adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/',pages);


//start the server
const port = 3000;
app.listen(port,() =>{
    console.log(`Listening on ${port}`);
})