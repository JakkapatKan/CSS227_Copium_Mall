var   express   = require('express'),
app             = express(),
bodyParser      = require('body-parser'),
mongoose        = require('mongoose'),
flash           = require('connect-flash'),
methodOverride  = require('method-override'),
passport        = require('passport'),
LocalStrategy   = require('passport-local'),
Product         = require('./models/product'),
Cart            = require('./models/cart'),
Comment         = require('./models/comment'),
User            = require('./models/user'),
path            = require('path'),
paypal          = require('paypal-rest-sdk'),
seedDB          =  require('./seeds');

var productRoutes    = require('./routes/products'),
commentRoutes       = require('./routes/comments'),
cartRoutes         = require('./routes/cart'),
indexRoutes         = require('./routes/index');
mongoose.connect('mongodb://localhost/ShopDatabase');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(flash());

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZY_xdYbL2SRyUOypHKumpYmkrWCnbzsZ8EvqacMY1lgyNCvacENX2GJLz1CeHKxkbBH5w2sEXS_zSeJ',
    'client_secret': 'EOyJHPz3E6DoKfIdWrXtO6fjpyzyK-rmsmqfSrctrEL1w-As5sisCdqDAhKMr_AN65bC2nIH5-K9tzbk'
  });
  

//app.use(express.static(__dirname + 'public'));
app.use(methodOverride('_method'));
app.use(express.static('./public'));

//SeedDB Activator
//seedDB();



app.use(require('express-session')({
    secret: ' ',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/', indexRoutes);
app.use('/product', productRoutes);
app.use('/product/:id/comments', commentRoutes);
app.use('/cart', cartRoutes);


app.listen(30000, function(){
    console.log('Server Live');
});    