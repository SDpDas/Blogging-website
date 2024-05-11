require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override'); // forces HTML form to do UPDATE and DELETE operations
const cookieParser = require('cookie-parser'); //Helps us to grab, save cookies and they keep us logged in 
const connectDB = require('./server/config/db');
const MongoStore = require('connect-mongo');
const session = require('express-session');

const {isActiveRoute} = require('./server/helpers/routeHelpers');


const app = express();
const PORT = process.env.PORT || 8950; 



//Connect to DB
connectDB();

app.use(express.urlencoded({ extended : true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.locals.isActiveRoute = isActiveRoute;

app.use(session(
    {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI
        }),
    }
));

// cookie: {maxAge: new Date (Date.now() + (3600000))} this is cookie expressions

app.use(express.static('public'));                                      

// Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const mainRoutes = require('./server/routes/main')(app); // Passing app to main.js
app.use('/', mainRoutes);
app.use('/', require('./server/routes/admin')); // does the same as 26 and 27 except we are routing to admin.js

app.listen(PORT, () => {        
    console.log(`App listening to port ${PORT}`);
});