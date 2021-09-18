const express = require('express');
const router = express.Router();

const { check, body, validationErrors } = require('express-validator');

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

router.post('/add-category',(req,res)=> {

    req.checkBody('title', 'Title must have a value').notEmpty();

    const title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();

    const errors = req.validationErrors();

    if (errors.length !== 0){
        // console.log("en eimai mesa");
        // console.log("errors " +errors.array().length);
        res.render('admin/add_category',{
            errors: errors,
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

router.post('/edit-category/:id',(req,res)=> {

    req.checkBody('title', 'Title must have a value').notEmpty();

    const title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    const id = req.params.id;

    const errors = req.validationErrors();

    if (errors.length !== 0){
        // console.log("en eimai mesa");
        // console.log("errors " +errors.array().length);
        res.render('admin/edit_category',{
            errors: errors,
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