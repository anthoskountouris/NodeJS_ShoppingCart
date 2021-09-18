const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const multer = require("multer");
// const { storage } = require('../cloudinary');
// const upload = multer({ storage }).single("image");

// File upload folder
const DIR = './public/product_images';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, fileName)
    }
  });

const upload = multer({
storage: storage,
fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    cb(null, true);
    } else {
    cb(null, false);
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}
});

const { check, body, validationErrors, isImage } = require('express-validator');

// Get Product model
const Product = require('../models/products');

// Get Category model
const Category = require('../models/category');
const { mkdirP } = require('mkdirp');

/*
/ GET products index
*/
router.get('/', (req,res)=> {
    let count;
    Product.count((err,c)=>{
        count = c;
    });

    Product.find((err,products)=>{
        res.render('admin/products',{
            products: products,
            count : count
        });
    });

});

/*
/GET add product
*/
router.get('/add-product', (req,res)=> {

    const title = "";
    const price = "";
    const desc = "";

    Category.find((err, categories)=>{
        res.render('admin/add_product',{
            title: title,
            price: price,
            categories: categories,
            desc: desc
        });
    });
});

/*
/ Post add product
*/

router.post('/add-product',upload.single('image'),(req,res)=> {


    // if (!(req.files && req.files.image)){
    //     console.log('NUUULLL');
    // }

    // const imageFile = typeof req.files.image !=="undefined" ? req.files.image.name : "";
    // }else if(!req.files){ 
    //     imageFile =""; 
    // }else if(req.files){
    //     const imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    // }

    
    // if(!req.files){ 
    //     imageFile =""; }
    // if(req.files){
    //     const imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    // }
    

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    // req.checkBody('image','You must upload an image').custom((value, {req.files.image}) => {
    //     switch (path.extname(imageFile.toLowerCase())) {
    //         case '.jpg':
    //             return '.jpg';
    //         case '.jpeg':
    //             return '.jpeg';
    //         case  '.png':
    //             return '.png';
    //         default:
    //             return false;
    //     }});

    const title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;

    const errors = req.validationErrors();

    console.log("errors: " + errors);
    

    if (errors){
        console.log("eshei errors");
        console.log("errors " + errors.length);

        Category.find((err, categories)=>{
            res.render('admin/add_product',{
                errors: errors,
                title: title,
                price: price,
                categories: categories,
                desc: desc
            });
        });
    } else {
        // console.log("eimai mesa");
        Product.findOne({slug: slug}, function(err, product){
            if(product) {
                req.flash('danger','Product slug exists, choose another');
                Category.find((err, categories)=>{
                    res.render('admin/add_product',{
                        title: title,
                        price: price,
                        categories: categories,
                        desc: desc
                    });
                });
            } else {
                const price2 = parseFloat(price).toFixed(2);
                const product = new Product({
                title: title,
                slug: slug,
                desc: desc,
                price: price2,
                category: category,
                image: imageFile
            });

            console.log(product)

            // product.save(function(err){
                // if(err) 
                // return console.log(err);

                // mkdirp('public/product_images/'+product._id, function(err){
                //     return console.log(err);
                // });
                // mkdirp('public/product_images/'+product._id + '/gallery', function(err){
                //     return console.log(err);
                // });
                // mkdirp('public/product_images/'+product._id + '/gallery/thumbs', function(err){
                //     return console.log(err);
                // });

                // if(imageFile != ""){
                //     const productImage = req.files.image;
                //     const path = 'public/product_image' +product._id + '/' + imageFile;

                //     productImage.mv(path, function(err){
                //         return console.log(err);
                //     })
                // }

                 req.flash('success','Product added!');
                 res.redirect('/admin/products');
            // });

            }

        }); 
    }
});

/*
 POST pareorder pages
*/
router.post('/reorder-pages', function(req,res) {
    const ids = req.body['id[]'];
    console.log(ids);
    console.log(req.body);
    console.dir(req.body);

    // const count = 0;

    // for(let i=0; i<ids.length; i++){
    //     const id = ids[i];
    //     count++;

    //     (function(count) {

    //     Page.findById(id, (err,page)=>{
    //         page.sorting = count;
    //         page.save((err)=>{
    //             if(err) 
    //                 return console.log(err);
    //         });
    //      });
    //     })(count);
    // }
});

/*
/GET edit page
*/
router.get('/edit-page/:id', function(req,res){
    console.log(req.params.slug)
    Page.findById(req.params.id, function(err,page){
        if (err)
            return console.log(err);

        res.render('admin/edit_page',{
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

/*
* POST edit-page
*/

router.post('/edit-page/:id',(req,res)=> {

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty()

    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    const errors = req.validationErrors();

    if (errors.length !== 0){
        console.log("en eimai mesa");
        console.log("errors " +errors.length);
        res.render('admin/edit_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        console.log("eimai mesa");
        Page.findOne({slug: slug, _id: {'$ne':id}}, function(err,page){
            if(page) {
                req.flash('danger','Page slug exists, choose another');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content:content,
                    id: id
                });
            } else {
              Page.findById(id, function(err,page){
                  if (err) return console.log(err);

                  page.title = title;
                  page.slug = slug;
                  page.content = content;

                page.save(function(err){
                    if(err) 
                    return console.log(err);

                    req.flash('success','Page added!');
                    res.redirect('/admin/pages/edit-page/'+ id);
                });

              });
            }

        }); 
    }
});

/*
/ GET delete index
*/
router.get('/delete-page/:id', (req,res)=> {
    Page.findByIdAndRemove(req.params.id, function(err){
    if (err) return console.log(err);

    req.flash('success','Page delete!');
    res.redirect('/admin/pages/');

    });
});

//exports
module.exports = router;