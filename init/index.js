const mongoose = require("mongoose");
const initData = require("./dat");
const Listing=require("../models/listing.js")
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
const initDB=async()=>{
    await Listing.deleteMany({});
        initData.data=initData.data.map(
          (obj)=>({...obj,
          owner:'68fe2d9dd7b1fb1d20ee767d'}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();
