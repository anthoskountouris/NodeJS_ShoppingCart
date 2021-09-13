const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const { check, body, validationResult } = require('express-validator');

// Get Product model
const Product = require('../models/product');

/*
/ GET pages index
*/
router.get('/', (req,res)=> {
    Page.find({}).sort({sorting: 1}).exec(function(err,pages){
        res.render('admin/pages',{
            pages:pages
        });
    });
});

/*
/GET pages index
*/
router.get('/add-page', (req,res)=> {

    const title = "";
    const slug = "";
    const content = "";

    res.render('admin/add_page',{
        title: title,
        slug: slug,
        content: content
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

router.post('/edit-page/:id',body('title','Title must have a value').notEmpty(),
body('content','Content must have a value').notEmpty(),(req,res)=> {
    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

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