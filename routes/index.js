
var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user'),
    Product = require('../models/product'),
    Cart    =   require('../models/cart'),
    Invoice    =   require('../models/invoice'),
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
    
    passport=  require('passport');




/*---------------------------------Home---------------------------------------------*/   
router.get('/', function(req, res){

    Product.aggregate([{$sample:{size:4}}]).exec(function(err, allProduct){
        if(err){
            console.log(err);
        } else {
            res.render('home.ejs', {Product: allProduct});
        }
    });
    


});

/*---------------------------------Register---------------------------------------------*/
router.get('/register', function(req, res){
    res.render('register.ejs');
});

router.post('/register',upload.single('profileImage'), function(req, res){
    req.body.profileImage = '/uploads/' + req.file.filename;
    
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        address: req.body.address,
        profileImage: req.body.profileImage
    });
    if(req.body.adminCode === 'admin'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            console.log(err)
            req.flash('error', err.message)
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function(){
            req.flash('success','Register Successfully, Greetings ' + user.username)
            res.redirect('/product');
        });
    });
});

/*---------------------------------Login---------------------------------------------*/
router.get('/login', function(req, res){
    res.render('login.ejs');
});

router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true,
        successFlash: 'Logged in Successfully',
        failureFlash: 'Invalid username or password'
    }), function(res, res){       
});

/*---------------------------------Logout---------------------------------------------*/
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success','Logged out Successfully')
    res.redirect('/');
});

/*---------------------------------about---------------------------------------------*/
router.get('/about',function(req,res){
    res.render('about.ejs');
})


/*---------------------------------User profile---------------------------------------------*/
router.get('/user/:id',middleware.isLoggedIn,function(req,res){
    User.findById(req.params.id, function(err,foundUser){
        if(err){
            req.flash('error','Error')
            return res.redirect('/')
        }
        Product.find().where('author.id').equals(foundUser._id).exec(function(err,foundProduct){
            if(err){
                req.flash('error','Error')
                return res.redirect('/')
            }
            res.render('user/show.ejs', {user: foundUser, product: foundProduct})
        })
    })
})

/*---------------------------------Edit user profile---------------------------------------------*/
router.get('/user/:id/edit',middleware.isLoggedIn, function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render('user/edit.ejs', {user: foundUser})
        }
    })
})
router.put('/user/:id', upload.single('profileImage'), function(req,res){
    
    if(req.file){
        req.body.user.profileImage = '/uploads/'+ req.file.filename;
        console.log(req.body.user);
    }

    User.findByIdAndUpdate(req.params.id, req.body.user, function(err,updatedUser){
        if(err){
            res.redirect('back');
            console.log(err);
        }else{
            // req.flash('success', 'Updated Successfully')
            res.redirect('/user/' + req.params.id);
            // res.redirect('/');
        }
    });
});


router.get('/manageUserbyadmin',middleware.isLoggedIn,middleware.userisAdmin, function(req,res){
    User.find({}, function(err, allUser){
        if(err){
            console.log(err);
        }else{
            res.render('user/managebyadmin.ejs', {user: allUser})
        }
    })
})

/*---------------------------------Delete user---------------------------------------------*/
router.delete('/user/:id', function(req,res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/');
        }else{
            req.flash('success', 'Account Deleted Successfully')
            res.redirect('/');
        }
    })
})


/*----------------------------- Purchase History--------------------------------------------*/
router.get('/:username/history', middleware.isLoggedIn, function(req, res){
    var owner = req.params.username
    //console.log(owner)   
    Invoice.find({ "buyer.username" : owner}, function(err, buyHistory){
        if(err){
            console.log(err);
        } else {
            // console.log(buyHistory);
            res.render('order/orderhistory.ejs', {buyHistory: buyHistory,owner: owner });
        }
    });

});

router.get('/orderhistory/:id', middleware.isLoggedIn, function(req, res){
    var invoice_id = req.params.id
    
    //console.log(owner)   
    Invoice.findById(invoice_id, function(err, foundInvoice){
        if(err){
            console.log(err);
        } else {
            // console.log(buyHistory);
            res.render('order/orderhistory_detail.ejs', {foundInvoice: foundInvoice,invoice_id: invoice_id});
        }
    });

});


module.exports = router;