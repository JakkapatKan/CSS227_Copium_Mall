var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var UserSchema = new mongoose.Schema({
    username:{type: String, unique: true},
    password: String,
    profileImage:{type:String, default: "/uploads/profileImage-1624108923601.jpg"},
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    isAdmin: {type: Boolean,default: false},
    cart_count:{type: Number, default: 0}

    

});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);