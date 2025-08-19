const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing=require("./models/listing")
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema");
const Review = require("./models/review");
main()
  .then((res) => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/airnb");
}

app.set("view-engine" ,"ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")))
app.engine("ejs",ejsMate);


app.get("/",(req,res)=>{
    res.send("hii! I am root")
});

const validateListing=(req,res,next)=>{
  const {error}=listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");}
  else{
    next();
  }
}
  
//all listings title
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {
      allListings,
    });
  })
);

//New Route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
})

//show route for individual title
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);


//Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
  })
);


//Edit &Update Route

app.get(
  "/listings/:id/edit",validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

app.put(
  "/listings/:id",validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);
//Delete route

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);
//REVIEWS
app.post("/listings/:id/reviews",async(req,res)=>{
let listing=await Listing.findById(req.params.id);
let newReview=new Review(req.body.review);

listing.review.push(newReview);

await newReview.save();
await listing.save();

res.redirect(`/listings/${listing_id}`)
})


// app.get("/testListing",async(req,res)=>{
// let sampleListing =new Listing({
//     title:"My new Villa",
//     description:"By the beach",
//     price:1200,
//     location:"Calangute Goa",
//     country:"India"
// })
// await sampleListing.save();
// console.log("sample was saved");
// res.send("successful test")
// })

app.use((req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));
});
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).render("./listings/error.ejs",{message});
//res.status(statusCode).send(message);
})

app.listen(8080,()=>{
console.log("server is listening on port 8080")
})