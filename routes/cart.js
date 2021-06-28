const { isLoggedIn } = require('../middleware');

var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user'),
    Product = require('../models/product'),
    Cart    =   require('../models/cart'),
    Invoice    =   require('../models/invoice'),
    path = require('path'),
    middleware = require('../middleware'),
    paypal          = require('paypal-rest-sdk'),
    passport=  require('passport');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZY_xdYbL2SRyUOypHKumpYmkrWCnbzsZ8EvqacMY1lgyNCvacENX2GJLz1CeHKxkbBH5w2sEXS_zSeJ',
    'client_secret': 'EOyJHPz3E6DoKfIdWrXtO6fjpyzyK-rmsmqfSrctrEL1w-As5sisCdqDAhKMr_AN65bC2nIH5-K9tzbk'
}); 




/*---------------------------------Cart page---------------------------------------------*/
router.get('/', middleware.isLoggedIn, function(req, res){
    var owner = req.user.username
    //console.log(owner)   
    Cart.find({cartLister: owner}, function(err, allCart){
        if(err){
            console.log(err);
        } else {
            res.render('cart.ejs', {cart: allCart });
        }
    });

});

/*---------------------------------add to cart---------------------------------------------*/
router.post('/add/:id', middleware.isLoggedIn, function(req, res){
    
    var added_prod_id_name = req.params.id +'_'+ req.user.username
    req.body.cart
    req.body.cart.author = {
        id: req.user._id,
        username: req.user.username
    }
    req.body.cart.cartLister = req.user.username
    req.body.cart.signature = added_prod_id_name
    


    //console.log(added_prod_id_name)

    
    Cart.create(req.body.cart, function(err, newlyCreated){

        if(err){
            console.log(err);
            req.flash('error', 'This product already in cart')
            res.redirect('back')
        } else{
            req.flash('success', 'Product added to cart')
            res.redirect('back')
        }
    });



});



/*---------------------------------Delete product from cart---------------------------------------------*/
router.delete('/:id',function(req,res){
    req.user.cart_count -= 1
    Cart.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash('error', 'Something went wrong')
            res.redirect('/cart');
        }else{

            req.flash('success', 'Remove Successfully')
            res.redirect('/cart');

        }
    })
})

/*---------------------------------update amount to buy ---------------------------------------------*/
router.put('/:id/update',middleware.isLoggedIn ,  function(req,res){
    
    target_product = req.params.id
    
    req.body.cart.cost = req.body.cart.buyAmount * req.body.cart.pr
    //console.log(req.body.cart.cost)

    Cart.findByIdAndUpdate(target_product, req.body.cart, function(err,updatedProduct){
        if(err){
            //res.redirect('/product/' + req.params.id +'/edit' );
            req.flash('error', 'Something went wrong')
            console.log(err);
            res.redirect('/cart' );
        }else{
            
            
            //req.flash('success', 'Updated Successfully')
            res.redirect('/cart' );
        }
    });


});


/*---------------------------------Order Confirmation---------------------------------------------*/
router.get('/orderconfirm', middleware.isLoggedIn, function(req, res){
    var owner = req.user.username
    var ownerID = req.user._id
    //console.log(owner)   
    
    User.findById(ownerID, function(err,owner_info){
        if(err){
            req.flash('error','Error')
            return res.redirect('/')
        }else{
            Cart.find({cartLister: owner}, function(err, allCart){
                if(err){
                    console.log(err);
                } else {
                    res.render('order/orderconfirm.ejs', {cart: allCart,owner: owner_info});
                }
            });
            

        }
        
    })
    

});


/*---------------------- Paypal gateway(usable but not complete) ----------------------------------*/
router.post('/pay', function(req,res){
    


    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:30000/",
            "cancel_url": "http://localhost:30000/product"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "13.37",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "13.37"
            },
            "description": "This is the payment description."
        }]
    };

paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
                req.flash('success', 'Order Successfully, Thank you for shopping with us!!')
                res.redirect(payment.links[i].href);
            }

        }
    }

});    



})    


/*---------------------------------add data to invoice---------------------------------------------*/
router.post('/add_invoice', middleware.isLoggedIn, function(req, res){
    let buyer_id = req.user._id
    var owner = req.user.username
    req.body.invoice.buyer = {
        username: owner,
        id: buyer_id
    }
    
    



    Invoice.create(req.body.invoice, function(err, newInvoice){

        if(err){
            console.log(err);
            req.flash('error', 'something wrong')
            res.redirect('/')
        } else{


            Cart.find({cartLister: owner}, function(err, allCart){
                if(err){
                    console.log(err);
                } else {
                    
                        

                    allCart.forEach(function (cart_product){
                        let bought_product = {
                            id: cart_product.id,
                            name: cart_product.name,
                            image: cart_product.image,
                            pr: cart_product.pr,
                            buyAmount: cart_product.buyAmount
                        }
                        newInvoice.product.push(bought_product)
                        newInvoice.date = Date.now()
                        


                        let qty_left = cart_product.qty - cart_product.buyAmount
                        Product.findByIdAndUpdate(cart_product.id, {qty:qty_left } , 
                        function(err,updatedProduct){
                            if(err){
                                console.log(err);
                            }
                        });


                    })
                    newInvoice.save()
                    //------------------------------ empty cart on buying----------------------------------------
                    Cart.deleteMany({cartLister: owner}, function(err){
                        if(err){
                            req.flash('error', 'Something went wrong')
                            res.redirect('/cart');
                        }else{
                            
                            req.flash('success', 'Order Successfully, Thank you for shopping with us!!')
                            //console.log(newInvoice._id)
                            res.redirect('/orderhistory/'+newInvoice._id);
                
                        }
                    })



                }
            });
            
        }

    });

});






module.exports = router;