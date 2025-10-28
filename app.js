if(process.env.NODE_ENV!="production"){
require('dotenv').config()
}



const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const session =require("express-session");
const flash=require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const MongoStore=require("connect-mongo")

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")
main()
  .then((res) => {
    console.log("mongodb connected");
 
   
  })
  .catch((err) => {
    console.log(err);
  });


async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);

}


app.set("view engine" ,"ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")))
app.engine("ejs",ejsMate);
const store=MongoStore.create({
  mongoUrl:process.env.ATLASDB_URL,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600
})
store.on("error",()=>{
console.log("Error in mongo session store",err);
})
const sessionOptions={
  store:store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }

};


// app.get("/",(req,res)=>{
//     res.send("hii! I am root")
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.success= req.flash("success");
   res.locals.error= req.flash("error");
    res.locals.currentUser= req.user;
  next();
})



//listings
app.use("/listings",listingRouter);
//REVIEWS
app.use("/listings/:id/reviews",reviewRouter);
//User router
app.use("/",userRouter);
app.use((req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));
});
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).render("./listings/error.ejs",{message,statusCode});
//res.status(statusCode).send(message);
})

app.listen(8080,()=>{
console.log("server is listening on port 8080")
})