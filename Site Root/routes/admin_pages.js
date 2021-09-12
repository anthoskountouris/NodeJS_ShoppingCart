const express = require('express');
const router = express.Router();

const { check, body, validationResult } = require('express-validator');

// Get page model
const Page = require('../models/page');
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
//exports
module.exports = router;