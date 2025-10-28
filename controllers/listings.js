const Listing=require("../models/listing")


module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {
      allListings,
    });
  }

  module.exports.renderNewForm=(req, res) => {

  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(listing.location)}&apiKey=${process.env.GEOAPIFY_API_KEY}`
    );

    // 🧾 Get raw text instead of JSON
    const rawText = await response.text();

    // 👇 Manually convert text → object
    const data = JSON.parse(rawText);

    // 🧭 Extract coordinates
    const coordinates = data.features?.[0]?.geometry?.coordinates || [77.2090, 28.6139];

    res.render("listings/show.ejs", { listing, coordinates });
  } catch (err) {
    console.error("Geocoding error:", err);
    res.render("listings/show.ejs", { listing, coordinates: [77.2090, 28.6139] });
  }
};


module.exports.createListing = async (req, res, next) => {
  try {
    // Extract image info from multer upload
    let url = req.file.path;
    let filename = req.file.filename;

    // Create new listing object
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // 🗺️ Convert location text → coordinates using Geoapify
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(newListing.location)}&apiKey=${process.env.GEOAPIFY_API_KEY}`
    );

    const rawText = await response.text();      // raw response string
    const data = JSON.parse(rawText);           // convert string → object

    // Extract coordinates [lng, lat]
    const coordinates = data.features?.[0]?.geometry?.coordinates || [0, 0];

    // Add GeoJSON geometry to your listing
    newListing.geometry = {
      type: "Point",
      coordinates: coordinates
    };

    // Save the listing with geometry + image + owner
    await newListing.save();

    req.flash("success", "New Listing Created Successfully!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Something went wrong while creating the listing!");
    res.redirect("/listings");
  }
};


  module.exports.renderEditForm=async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash("error", "Listing you requested for doesnot exist");
        return res.redirect("/listings")
      }
     let originalImageUrl= listing.image.url;
   originalImageUrl=  originalImageUrl.replace("/upload", "/upload/h_300,w_250")

      res.render("listings/edit.ejs", { listing ,originalImageUrl});
    }

    module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file!="undefined"){
   let url=req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();}
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }


  module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }