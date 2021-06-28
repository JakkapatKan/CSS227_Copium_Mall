var express = require('express'),
    router  = express.Router(),
    multer = require('multer'),
    path = require('path'),
    middleware = require('../middleware'),

    storage = multer.diskStorage({
        destination: function(req,file,callback){
            callback(null,'./public/uploads/');
        },
        filename:function(req,file,callback){
            callback(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }

    }),
    imageFilter = function(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
            return callback(new Error('Wrong image type'), false);
        }
        callback(null,true);
    },
    upload = multer({storage: storage, fileFilter: imageFilter}),
    Invoice    =   require('../models/invoice'),
    Cart    =   require('../models/cart'),
    Product  = require('../models/product');



/*---------------------------------All Product---------------------------------------------*/
router.get('/', function(req, res){
    Product.find({}, function(err, allProduct){
        if(err){
            console.log(err);
        } else {
            res.render('products/index.ejs', {Product: allProduct});
        }
    });

});


/*---------------------------------Look By Category---------------------------------------------*/
router.get('/category/:category', function (req, res) {
    
    var cat = req.params.category
    var ejsPath = 'category/' + cat
    //console.log(ejsPath)

    Product.find({ category: new RegExp(cat, 'i')}, function (err, foundProduct) {
        if (err) {
            console.log(err);
        } else {
            res.render(ejsPath,{Product: foundProduct})
           
        }
    });

});


/*---------------------------------Sort All Product---------------------------------------------*/
router.get('/sort/:sort_type', function(req, res) {

    var sort_type = req.params.sort_type

    if (sort_type === 'pr_asc') {       

        Product.find().sort({pr:1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render('products/index.ejs', {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'pr_dsc') {

        Product.find().sort({pr:-1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render('products/index.ejs', {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'name_asc') {

        Product.find().sort({name:1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render('products/index.ejs', {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'name_dsc') {

        Product.find().sort({name:-1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render('products/index.ejs', {Product: sortedProduct});
            }
        })
    }



})

/*---------------------------------Sort in Category---------------------------------------------*/
router.get('/category/:category/sort/:sort_type', function(req, res) {

    var category = req.params.category
    var ejsPath = 'category/' + category
    var sort_type = req.params.sort_type

    if (sort_type === 'pr_asc') {       

        Product.find({category: new RegExp(category, 'i')}).sort({pr:1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render(ejsPath, {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'pr_dsc') {

        Product.find({category: new RegExp(category, 'i')}).sort({pr:-1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render(ejsPath, {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'name_asc') {

        Product.find({category: new RegExp(category, 'i')}).sort({name:1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render(ejsPath, {Product: sortedProduct});
            }
        })
    }else if (sort_type === 'name_dsc') {

        Product.find({category: new RegExp(category, 'i')}).sort({name:-1}).exec(function(err,sortedProduct){
            if(err){
                console.log(err);
            }else{
                res.render(ejsPath, {Product: sortedProduct});
            }
        })
    }


})





/*---------------------------------Search function redirect---------------------------------------------*/
router.post('/search', function (req, res) {
    var name = req.body.search;
    var type = req.body.type;
    res.redirect('/product/search/' + type + '/' + name);

});

// router.get('/search/:name', function (req, res,) {
//     var name = req.params.name
//     Product.find({name:name}, function (err, foundProduct) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render('products/index.ejs',{Product: foundProduct})
           
//         }
//     })

// });

/*---------------------------------Search with category---------------------------------------------*/



router.get('/search/:category/:name', function (req, res,) {

    var name = req.params.name
    var type = req.params.category
    //console.log(name)
 

    if(type != "All Categories"){
        Product.find({ name: new RegExp(name, 'i'),category: new RegExp(req.params.category, 'i')}, function (err, foundProduct) {
            if (err) {
                console.log(err);
            } else {
                res.render('category/search_category.ejs',{Product: foundProduct,searchKey: name,type: type});
            }
        });
    }else{
        Product.find({ name: new RegExp(req.params.name, 'i')}, function (err, foundProduct) {
            if (err) {
                console.log(err);
            } else {
                res.render('category/search_category.ejs',{Product: foundProduct,searchKey: name,type: type});
            }
        });
    }


});

/*-------------------------------------Sort in Search with category---------------------------------------------*/
router.get('/category/:category/search/:search_keyword/sort/:sort_type', function(req, res) {

    var type = req.params.category
    var key = req.params.search_keyword
    var sort_type = req.params.sort_type

    if(type != "All Categories"){
        if (sort_type === 'pr_asc') {       
            Product.find({name: new RegExp(key, 'i'),category: new RegExp(type, 'i')}).sort({pr:1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })

        }else if (sort_type === 'pr_dsc') {       
            Product.find({name: new RegExp(key, 'i'),category: new RegExp(type, 'i')}).sort({pr:-1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })

        }else if (sort_type === 'name_asc') {       
            Product.find({name: new RegExp(key, 'i'),category: new RegExp(type, 'i')}).sort({name:1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })
            
        }else if (sort_type === 'name_dsc') {       
            Product.find({name: new RegExp(key, 'i'),category: new RegExp(type, 'i')}).sort({name:-1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })
            
        }

    }else{

        if (sort_type === 'pr_asc') {       
            Product.find({name: new RegExp(key, 'i')}).sort({pr:1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })

        }else if (sort_type === 'pr_dsc') {       
            Product.find({name: new RegExp(key, 'i')}).sort({pr:-1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })

        }else if (sort_type === 'name_asc') {       
            Product.find({name: new RegExp(key, 'i')}).sort({name:1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })
            
        }else if (sort_type === 'name_dsc') {       
            Product.find({name: new RegExp(key, 'i')}).sort({name:-1}).exec(function(err,sortedProduct){
                if(err){
                    console.log(err);
                }else{
                    res.render('category/search_category.ejs',{Product: sortedProduct,searchKey: key,type: type});
                }
            })
            
        }
    }
})





/*---------------------------------Add Product---------------------------------------------*/
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res){
    req.body.product
    req.body.product.image = '/uploads/'+req.file.filename;
    req.body.product.author = {
        id: req.user._id,
        username: req.user.username
    };

    Product.create(req.body.product, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            req.flash('success', 'Product Listed')
            res.redirect('/product');
        }
    });
});


router.get('/new', middleware.isLoggedIn, function(req,res){
    res.render('products/new.ejs');
});


/*---------------------------------Product Page---------------------------------------------*/
router.get("/:id", function(req, res){
    var prod_id = req.params.id
    Product.findById(req.params.id).populate('comments').exec(function(err, foundProduct){
        if(err){
            console.log(err);
        } else {
            res.render("products/show.ejs", {product: foundProduct,prod_id: prod_id});
        }
    });
});

/*---------------------------------Edit Product---------------------------------------------*/
router.get('/:id/edit',middleware.checkOwner, function(req,res){
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            console.log(err);
        }else{
            res.render('products/edit.ejs', {product: foundProduct})
        }
    })
})

router.put('/:id', upload.single('image'), function(req,res){
    
    if(req.file){
        req.body.product.image = '/uploads/'+ req.file.filename;
        console.log(req.body.product);
    }

    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err,updatedProduct){
        if(err){
            //res.redirect('/product/' + req.params.id +'/edit' );
            console.log(err);
        }else{






            req.flash('success', 'Updated Successfully')
            res.redirect('/product/' + req.params.id);



        }
    });
});


/*---------------------------------Delete Product---------------------------------------------*/
router.delete('/:id', middleware.checkOwner,function(req,res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/product/');
        }else{

            Cart.deleteMany({id:req.params.id}, function(err){
                if(err){
                    req.flash('error', 'Something went wrong')
                    res.redirect('/cart');
                }else{
        
                    req.flash('success', 'Deleted Successfully')
                    res.redirect('/product/');
        
                }
            })

        }
    })
})

router.get("/:id/log",middleware.isLoggedIn,middleware.userisAdmin, function(req, res){
    var prod_id = req.params.id


    Invoice.find({ "product.id" : prod_id}, function(err, foundLog){
        if(err){
            console.log(err);
        } else {
            
            Product.findById(prod_id,function(err,foundProduct){
                if(err){
                    console.log(err)
                }else{
                    res.render('products/log.ejs', {foundLog: foundLog,foundProduct:foundProduct,prod_id: prod_id });
                }
            })

        }
    });
    


});





module.exports = router;