var mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
    id:String,
    name:String,
    pr: Number,
    qty: Number,
    image: String,
    buyAmount:{type:Number, default: 1},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    cartLister: String,
    signature:{type: String, unique: true},
    cost: {
        type: Number,
        default: function() {
          return this.buyAmount * this.pr
        }
    }

});

module.exports = mongoose.model('Cart', cartSchema);