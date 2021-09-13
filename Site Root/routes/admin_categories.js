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
/ GET add index
*/

router.post('/add-page',body('title','Title must have a value').notEmpty(),
body('content','Content must have a value').notEmpty(),(req,res)=> {
    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;

    const errors = validationResult(req);
    if (errors.array().length !== 0){
        console.log("en eimai mesa");
        console.log("errors " +errors.array().length);
        res.render('admin/add_page',{
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content
        });
    } else {
        console.log("eimai mesa");
        Page.findOne({slug: slug}, function(err,page){
            if(page) {
                req.flash('danger','Page slug exists, choose another');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content:content
                });
            } else {
                const page = new Page({
                title: title,
                slug: slug,
                content: content,
                sorting: 100
            });

            page.save(function(err){
                if(err) 
                return console.log(err);

                req.flash('success','Page added!');
                res.redirect('/admin/pages');
            });

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
/GET edit index
*/
router.get('/edit-page/:slug', function(req,res){
    console.log(req.params.slug)
    Page.findOne({slug: req.params.slug}, function(err,page){
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

router.post('/edit-page/:slug',body('title','Title must have a value').notEmpty(),
body('content','Content must have a value').notEmpty(),(req,res)=> {
    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;
    const id = req.body.id;

    const errors = validationResult(req);
    if (errors.array().length !== 0){
        console.log("en eimai mesa");
        console.log("errors " +errors.array().length);
        res.render('admin/edit_page',{
            errors: errors.array(),
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
                    res.redirect('/admin/pages/edit-page/'+page.slug);
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