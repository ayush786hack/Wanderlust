const Listing=require("./models/listing");
const { listingSchema,reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review"); 

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be logged In to create listing");
   return res.redirect("/login");
  }
  next();
}

//becoz passport dont have access to reslocals to delete url data when logged in

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl
  }
  next();
};


module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
let listing=await Listing.findById(id);
if(!listing.owner.equals(req.user._id)){
    req.flash("error","You are not the owner of this listing");
      return  res.redirect(`/listings/${id}`);
}
next();
};

module.exports.
validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview= (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isreviewAuthor=async(req,res,next)=>{
   let { id ,reviewId } = req.params;
let review=await Review.findById(reviewId);
if(!review.author.equals(req.user._id)){
    req.flash("error","You are not the author of this review");
      return  res.redirect(`/listings/${id}`);
}
next();
}