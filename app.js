if (process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

console.log(process.env.SECRET)
const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')


const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/review')
const { Cookie } = require('express-session')

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{useNewUrlParser:true,useUnifiedTopology:true});
    console.log(' MONGO DONE')
    
}
app.engine('ejs',ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
const sessionConfig={
    secret : 'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const validateCampground = (req,res,next)=>{
    
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success= req.flash('success')
    res.locals.error= req.flash('error')
    next()
})
app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err
    if(!err.message) err.message = 'oh No, Something Went Wrong'
    res.status(statusCode).render('error',{err})
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
