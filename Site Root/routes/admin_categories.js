const express = require('express');
const router = express.Router();

const { check, body, validationResult } = require('express-validator');

// Get Category model
const Category = require('../models/category');

/*
/ GET category index
*/
router.get('/', (req,res)=> {
    Category.find(function(err,categories){
        if (err) return console.log(err);
        res.render('admin/categories',{
            categories:categories
        });
    });
});

/*
/GET add category
*/
router.get('/add-category', (req,res)=> {

    const title = "";

    res.render('admin/add_category',{
        title: title
    })
});

/*
/ POST add category
*/

router.post('/add-category',body('title','Title must have a value').notEmpty(),(req,res)=> {
    const title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();

    const errors = validationResult(req);

    if (errors.array().length !== 0){
        // console.log("en eimai mesa");
        // console.log("errors " +errors.array().length);
        res.render('admin/add_category',{
            errors: errors.array(),
            title: title,
        });
    } else {
        // console.log("eimai mesa");
        Category.findOne({slug: slug}, function(err, category){
            if(category) {
                req.flash('danger','Category title exists, choose another');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                const category = new Category({
                title: title,
                slug: slug,
            });

            category.save(function(err){
                if(err) 
                return console.log(err);

                req.flash('success','Category added!');
                res.redirect('/admin/categories');
            });

            }

        }); 
    }
});


/*
/GET edit category
*/
router.get('/edit-category/:id', function(req,res){
    // console.log(req.params.slug)

    Category.findById(req.params.id, function(err,category){
        if (err)
            return console.log(err);

        res.render('admin/edit_category',{
            title: category.title,
            id: category._id
        });
    });
});

/*
* POST edit-category
*/

router.post('/edit-category/:id',body('title','Title must have a value').notEmpty(),(req,res)=> {
    const title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    const id = req.params.id;

    const errors = validationResult(req);

    if (errors.array().length !== 0){
        // console.log("en eimai mesa");
        // console.log("errors " +errors.array().length);
        res.render('admin/edit_category',{
            errors: errors.array(),
            title: title,
            id: id
        });
    } else {
        // console.log("eimai mesa");
        Category.findOne({slug: slug, _id: {'$ne':id}}, function(err,category){
            if(category) {
                req.flash('danger','Category title exists, choose another');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function(err,category){
                  if (err) return console.log(err);

                  category.title = title;
                  category.slug = slug;

                  category.save(function(err){
                    if(err) 
                    return console.log(err);

                    req.flash('success','Category edited!');
                    res.redirect('/admin/categories/edit-category/'+id);
                });

              });
            }

        }); 
    }
});

/*
/ GET delete category
*/
router.get('/delete-category/:id', (req,res)=> {
    Category.findByIdAndRemove(req.params.id, function(err){
    if (err) return console.log(err);

    req.flash('success','Category delete!');
    res.redirect('/admin/categories/');

    });
});

//exports
module.exports = router;