var mongoose = require('mongoose');
var Collection = require('./models/product');
var Comment = require('./models/comment');

var data = [
    {
        name:'Cookies', 
        image: '/uploads/image-1624111749642.jpg',
        desc: 'Danish cookies Danish cookies Danish cookies',
        pr: 20,
        qty: 50,
        category: 'Food'
    },
    
    
];



function seedDB(){
    Collection.remove({}, function(err){
        if(err) {
            console.log(err);
        }
        console.log("Database Reset");
        data.forEach(function(seed){
            Collection.create(seed, function(err, collection){
                if(err) {
                    console.log(err);
                } else {
                    console.log('New data added');
                }
            });
        });
    
    });
}

module.exports = seedDB;