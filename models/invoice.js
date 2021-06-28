var mongoose = require('mongoose');

var invoiceSchema = new mongoose.Schema({
    
    product: [{

        id:String,
        name: String,
        image: String,
        pr: Number,
        buyAmount:Number,

    }],

    buyer: {
        id:String,
        username: String,
        firstName:String,
        lastName:String,
        email:String,
        ship_address:String,
    },
    

    payment: {
        method:String,
        card_name:String,
        card_num:String,
        card_exp:String,
        card_cvv:String
    },
    date: Date,
    total_pr:Number

}, {
    timestamps: true
})

module.exports = mongoose.model('Invoice', invoiceSchema);